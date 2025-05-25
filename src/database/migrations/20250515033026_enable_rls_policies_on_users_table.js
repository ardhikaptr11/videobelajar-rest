/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.raw(`
		-- Enable Row-Level Security (RLS) on the users table
		ALTER TABLE users ENABLE ROW LEVEL SECURITY;

		-- Set a default role for the app_user role to 'anonymous'
		-- This will apply if no role is explicitly set via SET LOCAL
		ALTER ROLE app_user SET app.role TO 'anonymous';

		-- Policy: Allow users to select (read) only their own data or if they are admin
		CREATE POLICY "User can see their own data" ON users
		FOR SELECT
		USING (
			COALESCE (
				current_setting('request.jwt.claims.role', true),
				current_setting('app.role', true)
			) = 'admin'
			OR 
			COALESCE (
				current_setting('request.jwt.claims.userId', true),
				current_setting('app.current_user_id', true)
			) = user_id::text
			OR (
				COALESCE (
					current_setting('request.jwt.claims.role', true),
					current_setting('app.role', true)
				) IN ('anon', 'anonymous')
				AND NOT is_verified
			)
		);

		-- Policy: Allow unauthenticated (public/anonymous) users to insert data
		-- Typically used for registration
		CREATE POLICY "Public users can insert data" ON users
		FOR INSERT
		TO PUBLIC
		WITH CHECK (true);

		-- Policy: Allow users to update their own data or if they are admin
		CREATE POLICY "Users can update their own data" ON users
		FOR UPDATE
		USING (
			COALESCE (
				current_setting('request.jwt.claims.role', true),
				current_setting('app.role', true)
			) = 'admin'
			OR
			COALESCE (
				current_setting('request.jwt.claims.userId', true),
				current_setting('app.current_user_id', true)
			) = user_id::text
		);

		-- Policy: Allow users to delete their own data or if they are admin
		CREATE POLICY "Users can delete their own data" ON users
		FOR DELETE
		USING (
			COALESCE (
				current_setting('request.jwt.claims.role', true),
				current_setting('app.role', true)
			) = 'admin'
			OR
			COALESCE (
				current_setting('request.jwt.claims.userId', true),
				current_setting('app.current_user_id', true)
			) = user_id::text
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
            -- Drop policies if they exist
            DROP POLICY IF EXISTS "Public users can insert data" ON users;
            DROP POLICY IF EXISTS "User can see their own data" ON users;
            DROP POLICY IF EXISTS "Users can update their own data" ON users;
            DROP POLICY IF EXISTS "Users can delete their own data" ON users;

            -- Disable RLS
            ALTER TABLE users DISABLE ROW LEVEL SECURITY;

            -- Reset default app.role on app_user
            ALTER ROLE app_user RESET app.role;
        `
	);
};
