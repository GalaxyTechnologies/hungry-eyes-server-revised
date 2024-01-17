/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("photo_playlist", (table) => {
      table.string("pp_id").primary();
      table.integer("playlist_id").unsigned().notNullable();
      table
        .foreign("playlist_id")
        .references("playlist_id")
        .inTable("playlists")
        .onDelete("CASCADE");
      table.string("photo_id").notNullable();
      table
        .foreign("photo_id")
        .references("photo_id")
        .inTable("photos")
        .onDelete("CASCADE");
      table.string("url").notNullable();
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
      
            CREATE TRIGGER update_photo_playlist_updated_at BEFORE UPDATE
            ON photo_playlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("photo_playlist");
};
