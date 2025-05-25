/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.raw(`
        -- Enable Row-Level Security (RLS) on the courses table
		ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

		-- Policy: Allow users to select (read) course details but only admin can modify
        CREATE POLICY "Users can view courses but only admin can modify" ON courses
        FOR ALL
        TO AUTHENTICATED
        USING (
            COALESCE(
                current_setting('request.jwt.claims.role', true),
                current_setting('app.role', true)
            ) IN ('admin', 'user')
        )
        WITH CHECK (
            COALESCE(
                current_setting('request.jwt.claims.role', true),
                current_setting('app.role', true)
            ) = 'admin'
        );
	`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.raw(
		`
            -- Drop the policy if it exists
            DROP POLICY IF EXISTS "Users can view courses but only admin can modify" ON courses;

            -- Disable Row-Level Security (RLS) on the courses table
            ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
        `
	);
};
