/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.raw(
		`
            -- Policy: Allow unauthenticated (public/anonymous) to read data from the 'users' table
            -- Typically used for login and email verification
            CREATE POLICY "Allow anonymous user to lookup by email or token"
            ON users
            FOR SELECT
            USING (
                COALESCE (
                    current_setting('request.jwt.claims.role', true),
                    current_setting('app.role', true)
                ) IN ('anon', 'anonymous')
                AND (
                    COALESCE (
                        current_setting('request.jwt.claims.email', true),
                        current_setting('app.email', true)
                    ) = email
                    OR
                    COALESCE (
                        current_setting('request.jwt.claims.verif_token', true),
                        current_setting('app.verif_token', true)
                    ) = verif_token
                )
            );
        `
	);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.raw(
		`
            -- Drop policies if they exist
            DROP POLICY IF EXISTS "Allow anonymous user to lookup by email or token" ON users;
        `
	);
};
