
describe('CREATE TABLE', function () {

	it('DESCRIBE TABLE ' + $tableName + '; DROP TABLE ' + $tableName, function(done) {
		DynamoSQL.query("DESCRIBE TABLE " + $tableName + "	\
			", function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.query("DROP TABLE " + $tableName + "	\
						", function(err, data) {
							if (err)
								throw err
							else
								done()
						})
				}
			})
	});
	it('DESCRIBE TABLE ' + $hashTable + '; DROP TABLE ' + $hashTable, function(done) {
		DynamoSQL.query("DESCRIBE TABLE " + $hashTable + "	\
			", function(err, data) {
				if (err) {
					if (err.code === 'ResourceNotFoundException')
						done()
					else
						throw err
				} else {
					DynamoSQL.query("DROP TABLE " + $hashTable + "	\
						", function(err, data) {
							if (err)
								throw 'delete failed'
							else
								done()
						})
				}
			})
	});

	it('waiting for ' + $tableName + ' table to delete (within 25 seconds)', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $tableName + "	\
				", function(err, data) {
					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}
				})
		}, 1000)
	})
	it('waiting for ' + $hashTable + ' table to delete (within 25 seconds)', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $hashTable + "	\
				", function(err, data) {

					if (err && err.code === 'ResourceNotFoundException') {
						clearInterval($existInterval)
						return done()
					}
					if (err) {
						clearInterval($existInterval)
						throw err
					}

					if (data.TableStatus === 'DELETING')
						process.stdout.write('.')
				})
		}, 1000)
	})

	it('CREATE TABLE ' + $tableName + ' ', function(done) {
		DynamoSQL.query("\
						CREATE TABLE " + $tableName + " (										\
							hash STRING,range NUMBER,											\
							gsi_string STRING,													\
							gsi_number NUMBER,													\
							lsi_string STRING,													\
							lsi_number NUMBER,													\
							PRIMARY KEY(hash,range)THROUGHPUT 5 5,								\
							INDEX gsi_string GSI ( hash, gsi_string)  THROUGHPUT 5 5,			\
							INDEX gsi_number GSI ( hash, gsi_number ) PROJECTION KEYS_ONLY,		\
							INDEX lsi_string LSI ( hash, lsi_string ) PROJECTION ALL ,		 	\
							INDEX lsi_number LSI ( hash, lsi_number ) PROJECTION(at1,at2)		\
						)																		\
			", {}, function(err, data ) {
				//console.log("reply from sql create table ",err, JSON.stringify(data,null,"\t"))
				if (err)
					throw err

				if (data.TableDescription.TableStatus === 'CREATING' || data.TableDescription.TableStatus === 'ACTIVE' )
					done()
				else
					throw 'unknown table status after create: ' + data.TableDescription.TableStatus
		})
	})

	it('CREATE TABLE ' + $hashTable + ' ', function(done) {
		DynamoSQL.query("\
						CREATE TABLE " + $hashTable + " (			\
							hash STRING,							\
							PRIMARY KEY ( hash  )					\
						)											\
						", {}, function(err, data ) {
				if (err) {
					throw err
				} else {
					if (data.TableDescription.TableStatus === 'CREATING' || data.TableDescription.TableStatus === 'ACTIVE' )
						done()
					else
						throw 'unknown table status after create: ' + data.TableDescription.TableStatus
				}
			})
	})

	it('waiting for table ' + $tableName + ' to become ACTIVE', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $tableName + "	\
				", function(err, data) {
					if (err) {
						throw err
					} else {
						//console.log("DESCRIBE TABLE ",err, JSON.stringify(data,null,"\t"))
						if (data.Table.TableStatus === 'ACTIVE') {
							clearInterval($existInterval)
							done()
						}
					}
				})
		}, 3000)
	})
	it('waiting for table ' + $hashTable + ' to become ACTIVE', function(done) {
		var $existInterval = setInterval(function() {
			DynamoSQL.query("DESCRIBE TABLE " + $hashTable + "	\
				", function(err, data) {
					if (err) {
						throw err
					} else {
						//process.stdout.write(".");
						//console.log(data.Table)
						if (data.Table.TableStatus === 'ACTIVE') {
							clearInterval($existInterval)
							done()
						}
					}
				})
		}, 3000)
	})

})
