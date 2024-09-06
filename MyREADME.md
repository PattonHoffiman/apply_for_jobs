## Desafio TOTVS

### 1 - Design
O Desenho da arquitetura planejada para resolver o desafio está dentro de **docs/Totvs_Desafio.drawio**

Optei por uma estrutura utilizando AWS pelo fácil acesso. Levando em consideração a estrutura de micro-serviços toda a lógica de back-end é fragmentada em pequenas funções.

Também pensei da estrutura do próprio Client, mas como o escopo do projeto é pequeno ele ficou bem simples tendo a estrutura de páginas, serviços e apis.

Internamente no projeto também existem estruturas para os componentes gráficos pensando na reusabilidade. Pensei em incorporar hooks para facilitar a interação dos states entre as páginas, porém devido ao tempo não pude implementar, o que resulta em arquivos grandes e alto acoplamento.

Como foquei mais na lógica do back-end deixei a resolução do front por último, mas já tenho a visão crítica de refatorar essas páginas e incluir uma estrutura melhor.

O Client obtém acesso através da API Gateway da AWS, nela está registrada apenas uma única API (Leviathan) já que todas as interações envolvem manipular senhas de alguma forma.

O Request é enviado pelo Client podendo acessar individualmente quatro rotas distintas:
  - Verify [PUT]
  - Store [POST]
  - Analyze [POST]
  - Generate [GET]

Cada uma dessas utiliza uma Lambda Function distinta e, antes que a mesma seja chamada para execução, também foram configuradas regras de consumo: estrutura de body e query params interceptadas pelo próprio API Gateway.

Tudo configurado através do .yml do serverless, assim o gasto em tempo de execução das lambdas são reduzidas e não preciso incluir lógicas de verificação sobre a existência dos dados enviados.

Chegando na camada das lambdas functions elas são mais diretas com as validações focando mais em regras de negócios e a interação com o banco de dados.

Duas lambdas necessitaram de libs externas do python para funcionarem devidamente, elas estão contidas no `aws_requirements.txt` da raiz de cada function.

É necessário realizar uma tratativa para que essas libs funcionem internamente na AWS, eu poderia enviar as libs inteiras, mas isso pesaria no envio de dados e também no tamanho final da lambda, optei por gerar um artifact com todas as libs zipadas, reduzindo drásticamente o tamanho final das lambdas
(de 2MB para 300 / 400 KB).

Para isso, tenho que instalar as libs em um layer com a estrutura recomendada pela AWS `layer/python/lib/python.3.x/site-packages/`.

Utilizando o `pip install -t {path} -r aws_requirements.txt` e zipando a pasta python eu gero o artifact com tudo necessário para a lambda funcionar devidamente.

Pelo próprio yml do serverless é possível configurar o envio dos artifacs zipados e assim consigo criar uma Layer lá no Lambda AWS então pelo próprio deploy eu já tenho toda a estrutura base.

Nas lambdas que manipulam o banco de dados, também tive que criar IAM Users, uma para cada lambda e com políticas próprias. Não encontrei formas de fazer isso pelo serveless então tive que criar pela AWS e salvar os arns no yml. Mas assim, o banco só é consumido com o user correto e o mesmo só pode realizar as tarefas específicas de sua política. Isso já evita algumas tentativas de manipulação maliciosas.

Por fim a Lambda que precisa entrar em contato com o db é validada pelo mesmo.

A última camada é a de persistência de dados utilizando o DynamoDB para salvar dados NoSQL, a estrutura da tabela é simples e objetiva.

O DynamoDB retornando o resultado da interação para a Lambda e a Lambda retornando o response adequado baseado nos resultados do DB é o ciclo natural.

O desafio maior foi configurar o CORS para essas lambdas, pois estou utilizando o Proxy Integration da AWS, vem automático quando subo as functions via serveless.

Então manualmente pela AWS também tive que configurar o CORS de cada lambda e isso gerou um link único para cada uma ser utilizada de forma pública.

O Proxy liberando acesso do response os dados finalmente são recebidos pelo Client e são feitas as devidas tratativas para exibir ao usuário.

### 2 - Explicação das Funções.

1 - Criação da Senha:

O usuário tem duas opções:
  - Digitar a Senha que deseja:
    - Por meio de um debouncer eu aguardo o usuário terminar de digitar a senha que deseja e expirando o tempo do debouncer eu envio a senha através da rota `/analyze`.

    - Optei por realizar a validação via back-end: levei em consideração que as regras de senha podem variar de empresa para empresa, mesmo com as políticas de complexidade existindo.
    
      Pode existir um cenário onde o cliente queira uma forma exclusiva na estrutura da senha, ou exista uma convenção interna.
      
      Ter que aplicar essas regras de validação em todos os X sistemas através do front-end é bem mais exaustivo do que aplicar elas em uma única lambda exclusiva para validação e uma vez alteradas todos os sistemas que consomem a mesma se beneficiarão sem afetar seus funcionamentos.

    - Com a senha avaliada a lambda retorna se a senha é válida juntamente com um status indicando o quão forte ela é.
    
      Em caso da senha quebrar algumas regras de negócio a lambda retorna uma mensagem de erro, exemplos: largura da senha inferior a 8 caracteres ou superior a 100 caracteres, senha possuir white_space.

    - Também tenho armazenado na lambda uma lista contendo as 200 senhas mais utilizadas no mundo em 2024, encontrei em um artigo da NordVPN (https://nordpass.com/most-common-passwords-list/).

      Utilizo essa lista para impedir que os usuários possam cadastrar senhas muito utilizadas, não importa o quão complexa ela seja na estrutura, se a mesma estiver no dicionário de um cracker ela não vai ter a utilidade.

  - Criar uma Senha randômica:
    - Aqui é mais simples, basta o usuário selecionar os critérios que deseja aplicar na senha e a sua largura.
    
      Um dropdown com opções selecionáveis já entrega todas as opções, sendo elas: "Lower Case", "Upper Case", "Digits" e "Specials".

    - O usuário tem a liberdade de selecionar quantos critérios desejar, mas será barrado se selecionar dois ou menos, pois forço o mesmo a criar uma senha que seja ao menos considerada "forte".

      As regras de largura de senha também são aplicadas nessa lambda.

    - A rota `/generate` é utilizada para essas validações e, com os critérios atendidos, a lambda retorna a senha randômica ao usuário.

      Não é necessário retornar indicação de status para que o mesmo queira corrigir, pois a senha sempre será considerada forte, diferentemente das senhas manuais, pois permito que sejam no mínimo "médias".

    - As mesmas motivações que utilizei para analisar a senha enviada pelo usuário também são contempladas nesse escopo.

      As regras para gerar randomicamente são mais simples ainda, mas podemos tornar o algoritmo mais complexo com regras próprias, ou focar em estratégias para manter a randomicidade cada vez mais afiada.

      Ter que replicar essa lógica em diversos fronts não é escalável e centralizar toda a lógica de gerar a senha em apenas uma lambda é bem mais produtivo.

2 - Especificar Número de Acessos para a Senha e Data de Expiração:

  - Nessa etapa, o usuário apenas insere o número de vezes que deseja acessar a senha, sendo infinitas vezes, não vejo razão para podar o número de acessos, até porque a probabilidade de esquecer a mesma tende a ser alta.

    Já em relação à data de expiração, eu separei em três categorias:

    **A) Expiração em Minutos (1 e 59 minutos).**

      Senhas de rápido acesso e duração curta poderiam ser utilizadas por guests ou acessos temporários de emergência, que nem cadastro de visitante em condomínio.

    **B) Expiração em Horas (1 e 23 horas).**

      Senhas um pouco mais prolongadas, mas que se mantêm do prazo máximo de 1 dia. Poderia ser utilizada para trials, eventos, palestras, algo nesse sentido.

      Elas teriam que ser renovadas diariamente, mas nesses cenários creio ser perfeitamente plausível.

    **C) Expiração em Dias (1 e 60 dias).**

      São as senhas de maior durabilidade, limitei em até 2 meses por questões de segurança, o próprio Google te avisa se suas senhas são as mesmas mais ou menos nesses prazos.

      Essa escolha é mais para forçar com que o usuário rotacione as suas senhas, principalmente se ele optar pelas randômicas.
      
      Claro que ele mesmo pode sempre cadastrar a mesma, mas isso dificilmente poderia ser contornado levando em consideração o escopo desse desafio, já que a senha deve ser apagada da base. Sem um log de histórico, não poderia impedir isso.

      O máximo que poderia ser feito seria algo voltado para o social, conscientização de segurança, etc.

  - Aqui optei por deixar a implementação no front-end, visto que o usuário é limitado a escolher valores fixos (Minuto, Hora, Dia), como a quantidade de acesso não é um problema, até porque a data de expiração já poda um número muito grande de acessos pela ação do tempo.

    E se for o caso de uma senha compartilhada ela poderia ter mais acessos que o usual, podar isso não faz muito sentido nesse cenário.

    Em relação ao usuário tentar adicionar mais que 59 minutos, 23 horas ou 60 dias: ele é bloqueado pelo front mesmo, o botão fica desabilitado. Se tratando de segurança não vejo razões de permitir que um usuário gere uma senha com mais de 60 dias.

    Claro que o cliente tem a palavra final e nesses casos cedemos, mas para esse desafio fixei essa ideia.

    Existe uma validação de tempo na lambda para inserir os dados no banco, no intuito de evitar que enviem uma data de expiração indevida por um HTTP Client (Insominia, Postman, HTTPie), mais para passar a perna nos espertinhos de plantão.

    Mas nesse cenário a validação é apenas de 60 dias, é muito remota a possibilidade de um usuário leigo querer burlar esssa regra apenas para ter mais tempo de duração na senha.

3 - Gerar URL para dar acesso à senha:
  - Com a senha, número de acessos e data de expiração devidamente validados vamos para a próxima etapa.
    
    Antes de eu realizar qualquer interação com a API eu criptografo a senha. Como ela deve ser exibida no front e eu não devo armazenar dados sensíveis no DB de forma crua optei por uma criptografia AES, já que a abordagem de hash não permite que eu reverta o estado da senha.

  - Assim posso reconverter a senha com o secret que está no .env do front. Dessa forma o DBA não tem acesso à senha de forma irrestrita e qualquer tentativa de obter a senha interceptando os requests também é frustada, pois sem o secret não dá para quebrar o AES.

  - A parte da criptografia eu mantive no front também, não faz sentido eu enviar a senha crua para o back e encriptar antes de salvar os dados, ela ficaria vulnerável a ser obtida com ataques do tipo **MITM**.

  - Com a senha encriptada eu envio todos os dados necessários pela rota `/store`, como já citado acima eu valido a data de expiração e em seguida registro os dados no DB.

  - Com eles registrados eu obtenho o ID referente e crio uma URL simples referente ao front, ex: https://nome-do-site/password/{id};

    E retorno ela para o front exibindo em tela. Cabe ao usuário copiar e colar o link ou apenas clicar para ser redirecionado.

    Obs. Escrevendo a Doc, notei que envio a URL exposta para o front, então ataques MITM poderiam ter acesso à senha a partir do link, nesse cenário eu teria que encriptar a URL antes de enviar. Fica de anotação para melhorias.

4 - Excluir a senha se a data expirar ou o número de acessos exceder:
  - Com o link em mãos o usuário pode interagir, clicando e visualizando sua senha, quantos acessos restam e a data limite para expirar.

    Isso auxilia o usuário a se lembrar da validade desse acesso e já se prontificar para criar uma nova.

  - Cada vez que o usuário clica no link, a página envia um request pela rota `/verify`enviando o ID da própria URL como parâmetro de busca, a lambda associada apenas consulta, retorna os dados vinculados e verifica se o a senha já expirou ou se o número de acessos é igual 0.

    Nesse caso esses dados já são excluídos do DB retornando um 404 para o usuário. Do contrário o número de acessos é reduzido em 1 e o item é atualizado no banco de dados, retornando os dados atualizados para serem exibidos pelo front.

    Novamente aqui podemos evitar o MITM, pois se ele tiver acesso somente ao ID da tabela o máximo que ele obteria seria a senha criptografada e sem o secret ele não conseguiria desfazer.

  - Caso retorne um 404 o usuário pode optar por criar uma nova senha clicando no botão que é exibido quando o front reconhece o status code 404.

  - Assim o ciclo é reiniciado.

Notas Finais:
  Ter que aprender a utilizar AWS API Gateway, Lambda Functions, DynamoDB, Python e diversas configurações para deixar tudo funcionando foi uma experiência que eu não tenho há muito tempo. Deu uma satisfação enorme de aprender diversas técnicas diferentes, parar para pensar na arquitetura de toda a solução, pensar no nível de segurança.

  Acho que senti uma pitadinha do dia a dia de você na TOTVS e foi uma experiência maravilhosa. Se tudo der certo definitivamente, eu creio me adequar nisso, meus olhos brilharam de empolgação para esse desafio. E para mim foi uma diversão.

  Claro que agora no final enquanto escrevo esse doc eu revejo alguns conceitos e penso em melhores alternativas para algumas resoluções, mas dado o prazo de 7 dias, isso que atrasei em 1, para refinar, estabilizar a build do front e escrever isso haha, mas convenhamos que esse cenário é relativamente comum, o que não pode é atrasar dias a fio.

  Como meu foco é front-end eu deixei ele por último, não foquei em um super design, até porque a carência em experiência prática em DevOps e Python me fez priorizar o back, pois entendi ser mais importante mostrar minhas habilidades nessa parte. Mesmo assim, considero o design final aceitável, não está quebrando no celular hahaha e a paleta é ergonômica aos olhos.

  Se eu tivesse mais tempo, faria algo mais rebuscado definitivamente.

  Novamente agradeço pela atenção e principalmente pelo desafio, eu aprendi muita coisa com essa experiência. o/

  att, Patton Hoffiman;


Obs. Caso precisem das variáveis ambiente me avisem que envio os .env do projeto.
Link de Acesso para a solução rodando: [https://patton-random-password.netlify.app/]
