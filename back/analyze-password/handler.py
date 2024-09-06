import string;
import json;

def handler(event, context):
  # * Load a List with 200 most used password around the world.
  # ? This article elucidate that: https://nordpass.com/most-common-passwords-list/
  def loadPasswordList():
    try:
      with open('./dictionaries/most_common_passwords.txt') as file:
        words = [line.strip() for line in file];
        return words;
    except FileNotFoundError as error:
      raise FileNotFoundError('most_common_passwords.txt not found.') from error;
    except Exception as error:
      raise RuntimeError(f"Error loading passwords list from most_common_passwords.txt: {str(error)}") from error;

  print(event);

  score = 0;
  status = '';
  password = str(json.loads(event['body'])['password']);

  def calcStrength(score: int):
    final = score/7;

    if (final > 0.01 and final <= 0.3): return 'weakest';
    elif (final > 0.3 and final<= 0.5): return 'weak';
    elif (final > 0.4 and final<= 0.6): return 'moderate';
    elif (final > 0.6 and final <= 0.8): return 'strong';
    else: return 'strongest';

  def verifyLength(password: str, score: int):
    if (password.__len__() > 100):
      raise ValueError("Very long length! Use a maximum of 100 characters.");
    if (password.__len__() < 8):
      raise ValueError("Needs at least 8 characters to make a reasonable password!");
    if (password.__len__() >= 15):
      score += 1;
    
    score += 1;
    return score;
  
  def verifyStruct(password: str, score: int):
    digit = list(string.digits);
    special = list(string.punctuation);
    upper = list(string.ascii_uppercase);
    lower = list(string.ascii_lowercase);

    if any(char in lower for char in password):
      score += 1;
    if any(char in upper for char in password):
      score += 1;
    if any(char in digit for char in password):
      score += 1;
    if any(char in special for char in password):
      score += 1;
  
    if ' ' in password:
      raise ValueError("Password cannot contain white spaces!");

    return score;

  def verifyPasswordList(password: str):
    return password in loadPasswordList();

  try:
    exists = verifyPasswordList(password);

    if (exists):
      raise ValueError('Weak and commonly used password!');

    score = verifyLength(password, score);
    score = verifyStruct(password, score);

    status = calcStrength(score);

    success = status != 'weakest' and status != 'weak';

    statusCode = 200 if success else 400;
    message = 'Valid Password!' if success else 'Weak Password! Please try a new one.';

    return {
      'statusCode': statusCode,
      'body': json.dumps({
        'success': success,
        'message': message,
        'data': {
          'strength': status,
        },
      }),
    };

  except ValueError as error:
    return {
      'statusCode': 400,
      'body': json.dumps({
        'success': False,
        'message': error.__str__(),
      }),
    };

  except FileNotFoundError as error:
    return {
      'statusCode': 404,
      'body': json.dumps({
        'success': False,
        'message': error.__str__(),
      }),
    };

  except RuntimeError as error:
    return {
      'statusCode': 500,
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