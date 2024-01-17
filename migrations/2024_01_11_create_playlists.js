/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("playlists", (table) => {
      table.string("playlist_id").primary();
      table.integer("user_id").unsigned().notNullable();
      table
        .foreign("user_id")
        .references("user_id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("name").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.raw(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = now(); 
              RETURN NEW;
            END;
            $$ language 'plpgsql';
      
            CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE
            ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("playlists");
};
