[![npm page](https://nodei.co/npm/@awspilot/dynamodb-sql.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/@awspilot/dynamodb-sql)

#dynamodb-sql



[![npm version](https://badge.fury.io/js/%40awspilot%2Fdynamodb-sql.svg)](https://badge.fury.io/js/%40awspilot%2Fdynamodb-sql)
[![Build Status](https://travis-ci.org/awspilot/dynamodb-sql.svg?branch=master)](https://travis-ci.org/awspilot/dynamodb-sql)


## Install

```
npm install @awspilot/dynamodb-sql
```

## Init


```
var db = require('@awspilot/dynamodb-sql')({
    "accessKeyId": "XXXXXXXXXXXXXXXX",
    "secretAccessKey": "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
    "region": "eu-west-1"
})

or

var AWS = require('aws-sdk');
var db = require('@awspilot/dynamodb-sql')(new AWS.DynamoDB());
```

## Execute Queries
```
db.query($query)
or
db.query( $query, callback )
or a promise call
db.queryp( $query ).then(args=>{
    var [err,data] = args
})
```

```
db.query(
    "   INSERT INTO                 " +
    "       users                   " +
    "   SET                         " +
    "       id='user@host',         " +
    "       userame=\"userhost\",   " +
    "       password=\"qwert\"      ",
    function(err, data) {
        console.log( err, data )
    })
```

## Comments

dynamodb-sql supports the following comment style
```

/* this is an in-line comment */

/*
this is a
multiple-line comment
*/

```

## SQL Operations

### List Tables

```

SHOW TABLES

```

### Describe Table

```

DESCRIBE TABLE tbl_name

```


### Create Table

DATA_TYPE can be STRING or NUMBER

provision throughput defaults to 1 1 for both table and GSI

index projection defaults to all attributes


```

CREATE TABLE tbl_name (
	partition_key DATA_TYPE,
	[ sort_key DATA_TYPE, ]
	[ gsi_partition_key DATA_TYPE [ , gsi_sort_key DATA_TYPE ] ,]
	[ lsi_sort_key DATA_TYPE, ]
	PRIMARY KEY( partition_key [, sort_key ] ) [ THROUGHPUT number number ] ,
	[ ,
		INDEX indexname GSI ( gsi_partition_key [, gsi_sort_key ] )
		[ PROJECTION ALL | KEYS_ONLY | ( atr1, atr2 [, atr3 ]) ]
		[ THROUGHPUT NUMBER NUMBER ]
	]
	[ ,
		INDEX indexname LSI ( partition_key , lsi_sort_key )
		[ PROJECTION ALL | KEYS_ONLY | ( atr1, atr2 [, atr3 ]) ]
	]
	[ , more index defintions ]
)

```

Create table with partition key only, default throughput is 1 read/s 1 write/s

```

CREATE TABLE tbl_name (
    hash_key STRING,
    PRIMARY KEY ( hash_key )
)

```

Create table with partition and sort key, specifying throughput

```

CREATE TABLE tbl_name (
    hash_key STRING,
    range_key NUMBER,
    PRIMARY KEY ( hash_key, range_key  ) THROUGHPUT 5 5
)

```

Create table with Global Seconday Index and Local Secondary Index and throughput for GSI

```

CREATE TABLE messages (
    user STRING,
    message_id STRING,
    shared_with STRING,
    starred NUMBER,
    PRIMARY KEY ( user, message_id ),
    INDEX shared GSI ( shared_with, message_id ) PROJECTION KEYS_ONLY,
    INDEX starred LSI ( user, starred ),
    INDEX test GSI ( alternate_partition ) PROJECTION ( starred, folder ) THROUGHPUT 9 9
)

```

### Delete Index

Only supported for GSI type indexes

```

DROP index idx_name ON tbl_name

```



### Delete Table

```

DROP TABLE tbl_name

```

### Insert
VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Insert will fail if another item with same key exists


```

INSERT INTO
    tbl_name
SET
    partition_key = <VALUE>,
    sort_key = <VALUE>
    [, other_key = <VALUE>, ... ]

```
```

INSERT INTO users SET
  domain     = 'test.com',
  user       = 'testuser',
  email      = \"testuser@test.com\",
  password   = 'qwert',
  created_at = 1468137790,
  updated_at = null,
  active     = false,
  profile    = {
                name: "Demo Account",
                contact :{
                  phone: ["+1 (908) 866 6336"],
                  emails: ["testuser@test.com", "demo.test@test.com"]
                }
              }

```

### Update

VALUE for partition_key and sort_key can be string or number, all other attributes can be string, number, boolean, array, object, null or any nested combination of these

Update will fail if the key specified in WHERE does not exist

WHERE condition must match the exact partition or partition/sort definition, UPDATE will only update one item!

Delete an item attribute by setting its value to undefined ( not "undefined" )

OP can be "=" or "+="

Increment an item's value by using attribute += value, attribute = attribute + value is not supported yet

```

UPDATE
    tbl_name
SET
    key1 OP <VALUE> [, key2 OP <VALUE>, ... ]
WHERE
    partition_key = <VALUE> AND sort_key = <VALUE>

```

```

UPDATE
    users
SET
    active = true,
    updated_at = 1468137844,
    activation_code = undefined,
    login_count += 1
WHERE
    domain = 'test.com' AND user = 'testuser'

```


### Replace

Inserts the item if it does not exists or fully replaces it.

```

REPLACE INTO
    tbl_name
SET
     partition_key = <VALUE>, sort_key = <VALUE> [, other_key = <VALUE>, ... ]

```

```

REPLACE INTO users SET
    domain         = 'test.com',
    user           = 'testuser',
    pending_delete = true

```

### Delete

WHERE condition must match the exact partition or partition/sort definition, DELETE will only delete one item!

```

DELETE FROM
    tbl_name
WHERE
    partition_key = <VALUE> AND sort_key = <VALUE>

```

### Select

for sort_key in WHERE OP can be:
* =  equal
* <  less than
* >  greater than
* <= less then or equal
* >= greater than or equal
* BEGINS_WITH
* BETWEEN

```

SELECT
    *
FROM
    tbl_name
[ USE INDEX index_name ]
WHERE
    partition_key = <VALUE>
    [ AND sort_key OP <VALUE> ]

[ HAVING attribute OP <VALUE> [ AND attribute OP <VALUE> ] ]
[ DESC ]
[ LIMIT <number> ]
[ CONSISTENT_READ ]

```

```

SELECT
    *
FROM
    users
WHERE
    domain = 'test.com' AND
    user = 'testuser'

```

```

SELECT
    *
FROM
    stats
WHERE
    domain = 'test.com' AND
    date BETWEEN [ '2016-01-01 00:00:00', '2016-01-01 23:59:59' ]
HAVING
    pageviews > 0 AND
    visitors > 0
DESC
LIMIT 5
CONSISTENT_READ

```

## ToDo
* support for binary data type
* support for stringSet and numberSet
* placeholder for values for all SQL operations ( attribute = :value )
* INSERT: batch insert in the form of " INSERT INTO tbl_name VALUES [{},{},{}] "
* INSERT: conditional insert
* INSERT: DUPLICATE KEY UPDATE
* INSERT: INSERT IGNORE support
* UPDATE: conditional update
* UPDATE: placeholder for values ( attribute = :value )
* REPLACE: conditional replace
* REPLACE: return all_old/updated_old/all_new/updated_new
* SELECT: continue from last item
* SELECT: OR support for HAVING
* SELECT: IN support for HAVING
* SELECT: currently only "*" is supported
* SELECT: count()
* get item and batch get item
* SHOW CREATE TABLE support
* "ALTER TABLE tbl_name ADD INDEX" support for GSI
* "ALTER TABLE tbl_name DROP INDEX" support for GSI
* etc.

## Done
* ~~DROP INDEX idx_name ON tbl_name~~
* ~~CREATE TABLE support throughput for both table and GSI~~
* ~~DROP TABLE support~~
* ~~DESCRIBE TABLE support~~
* ~~SHOW TABLES support~~
* ~~CREATE TABLE support GSI and LSI~~
* ~~CREATE TABLE support projection definition~~
* ~~support for inline single and multiline comments~~
* ~~UPDATE: increment support~~
* ~~UPDATE: delete attribute support~~
