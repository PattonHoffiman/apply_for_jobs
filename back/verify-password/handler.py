from datetime import datetime, timezone
from dateutil import parser
import dotenv
import boto3
import json
import os

dotenv.load_dotenv();

def handler(event, context):
  id = str(event['rawPath']).replace('/', '');

  client = boto3.client('dynamodb');
  resource = boto3.resource('dynamodb');

  def verify_expires(date: str) -> bool:
    return parser.parse(date) < datetime.now(timezone.utc);


  def get_table_name():
    name = os.getenv('table');
      
    if (name is None):
      raise RuntimeError('Internal Error');

    return name;

  def verify_if_table_exists(name: str):
    existing_tables: list[type[str]] = client.list_tables()['TableNames'];
    
    for table in existing_tables:
       if table == name:
          return True;
    
    return False;

  def get_item_by_id(name: str, id: str):
    table = resource.Table(name);

    row = table.get_item(
      Key={
        'id': id,
      }
    );
  
    if 'Item' in row:
      return row['Item'];

    raise ValueError('Password Not Found');

  def delete_item_by_id(name: str, id: str):
    table = resource.Table(name);
  
    table.delete_item(
      Key={
        'id': id,
      }
    );

  def update_times(item: any, name: str, updated_times: int):
    table = resource.Table(name);
    item['times'] = updated_times;
    table.put_item(Item=item);
    return item;

  try:
    table = get_table_name();
    exists = verify_if_table_exists(table);

    if (exists == False):
      raise ValueError('Resource Not Found');
  
    item = get_item_by_id(table, id);
    expires = str(item['expires']);
    times = int(item['times']);
    id = str(item['id']);

    expired = verify_expires(expires);

    if times == 0 or expired:
      delete_item_by_id(table, id);
      raise ValueError('Password Not Found');
    else:
      item = update_times(item, table, (times-1));

    return {
      'statusCode': 200,
      'body': json.dumps({
        'success': True,
        'data': {
          'salt': str(item['salt']),
          'times': int(item['times']),
          'expires': str(item['expires']),
          'password': str(item['password']),
        },
      }),
    };

  except ValueError as error:
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