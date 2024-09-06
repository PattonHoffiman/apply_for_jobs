from datetime import datetime, timezone
import dotenv
import boto3
import uuid
import json
import os

dotenv.load_dotenv();

def handler(event, context):
  enc = str(json.loads(event['body'])['enc']);
  salt = str(json.loads(event['body'])['salt']);
  times = int(json.loads(event['body'])['times']);
  expires = str(json.loads(event['body'])['expires']);
  
  client = boto3.client('dynamodb');
  resource = boto3.resource('dynamodb');

  # # For Test Function in AWS Lambda.s
  # enc = str(event['body']['enc']);
  # salt = str(event['body']['salt']);
  # times = int(event['body']['times']);
  # expires = str(event['body']['expires']);

  def get_table_name():
    name = os.getenv('table');
      
    if (name is None):
      raise RuntimeError('Internal Error');

    return name;

  def get_website_name():
    name = os.getenv('website');

    if (name is None):
      raise RuntimeError('Internal Error');

    return name;

  def create_table(name: str):
    params = {
       "TableName": name,
       "KeySchema": [
          {
            "KeyType": "HASH",
             "AttributeName": "id",
          }
       ],
       "AttributeDefinitions": [
          {
             "AttributeType": "S",
             "AttributeName": "salt",
          },
          {
             "AttributeType": "N",
             "AttributeName": "times",
          },
          {
             "AttributeType": "S",
             "AttributeName": "expires",
          },
          {
             "AttributeType": "S",
             "AttributeName": "password",
          },
       ],
       "ProvisionedThroughput": {
          "ReadCapacityUnits": 1,
          "WriteCapacityUnits": 1,
       }
    };

    table = client.create_table(**params);
    table.wait_until_exists();

  def validate_expires(date: str):
    insertion_date = datetime.fromisoformat(date);
    time_compare = datetime.now().replace(tzinfo=timezone.utc) - insertion_date;

    if (time_compare.days > 60):
      raise ValueError("Can't store expire dates with more than 60 days.")

  def verify_if_table_exists(name: str):
    existing_tables: list[type[str]] = client.list_tables()['TableNames'];
    
    for table in existing_tables:
       if table == name:
          return True;
    
    return False;

  def insert_data(name: str, data: dict[str, any]):
    table = resource.Table(name);
    id = str(uuid.uuid4());

    response = table.put_item(
      Item={
         'id': id,
         'salt': str(data['salt']),
         'times': int(data['times']),
         'password': str(data['enc']),
         'expires': str(data['expires']),
      }       
    );
  
    return {
       'id': id,
       'status': response['ResponseMetadata']['HTTPStatusCode'],
    };

  try:
    data = {
       'enc': enc,
       'salt': salt,
       'times': times,
       'expires': expires,
    };

    validate_expires(expires);

    table = get_table_name();
    exists = verify_if_table_exists(table);

    if exists == False:
       create_table(table);
    
    response = insert_data(table, data);

    if (int(response['status']) == 200):
      website = get_website_name();
      url = f'{website}password/{str(response['id'])}';

      return {
        'statusCode': 201,
        'body': json.dumps({
          'success': True,
          'data': {
            'url': url,
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
