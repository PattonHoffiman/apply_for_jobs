import string;
import random;
import json;

def handler(event, context):
  length = int(event['queryStringParameters']['length']);
  complexity = str(event['queryStringParameters']['complexity']);
  
  def evaluate_complexity(length: int, complexity: str):
    possibilities = [[str]];
    values = complexity.split(',');

    # ! Analyse Length.
    if (length < 8):
      raise ValueError("Needs at least 8 characters to make a reasonable password!");
    elif (length > 100):
      raise ValueError("Very long length! Use a maximum of 100 characters.");

    # ! Forces user to use at least three types for evaluate password complexity.
    if (values.__len__() <= 2):
      raise ValueError("Needs at least three types of values to make a strong password!");

    for value in values:
        match value:
          case 'lower':
            possibilities.append(list(string.ascii_lowercase));
          case 'upper':
            possibilities.append(list(string.ascii_uppercase));
          case 'numeric':
            possibilities.append(list(string.digits));
          case 'special':
            possibilities.append(list(string.punctuation));

    return possibilities;
  
  def shuffle_possibilities(possibilities: list[list[type[str]]]):
    for possibility in possibilities:
      random.shuffle(possibility);
  
  def generate(length: int, possibilities: list[list[type[str]]]):
    password = [];
  
    for _ in range(length):
      index = random.randrange(1, (possibilities.__len__()));
      char = random.choice(possibilities[index]);
      password.append(char);
    
    random.shuffle(password);
    return ''.join(password);

  try:
    possibilities = evaluate_complexity(length, complexity);
    shuffle_possibilities(possibilities);

    password = generate(length, possibilities);
  
    return {
      'statusCode': 200,
      'body': json.dumps(
        {
          'success': True,
          'message': 'Password Generated Successfully!',
          'data': {
            'password': password,
          },
        }
      ),
    };
  
  except ValueError as error:
    return {
      'statusCode': 400,
      'body': json.dumps({
        'success': False,
        'message': error.__str__(),  
      }),
    };

  except Exception as error:
    return {
      'statusCode': 500,
      'body': json.dumps({
        'success': False,
        'message': 'Internal Server Error',
      }),
    };