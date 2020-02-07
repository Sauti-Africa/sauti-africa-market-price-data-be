exports.up = function (knex) {
    return knex.schema.createTable('apiKeys', tbl => {
      tbl.increments()
      tbl
        .text('key', 128)
        .unique()
        .notNullable()
      tbl
        .text('user_id')
        .unique()
        .notNullable()
      //reset_date stores the date as milliseconds as an integer
      tbl
        .bigInteger('reset_date')
        .notNullable()
      tbl
        .integer('apikey_count')
        .defaultTo(0)
        .notNullable()
      tbl
        .string('user_role')
        .defaultTo('freeUser')
        .notNullable()
    })
  }
  
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists('apiKeys')
  }
