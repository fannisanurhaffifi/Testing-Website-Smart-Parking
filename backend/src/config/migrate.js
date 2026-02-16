const { query } = require("./database");

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Perpanjang kolom password di tabel pengguna
        try {
            await query("ALTER TABLE pengguna MODIFY COLUMN password VARCHAR(255) NOT NULL");
            console.log("✅ Column password in 'pengguna' updated to VARCHAR(255)");
        } catch (e) {
            console.error("❌ Failed to update password column in 'pengguna':", e.message);
        }

        // 2. Perpanjang kolom password di tabel admin
        try {
            await query("ALTER TABLE admin MODIFY COLUMN password VARCHAR(255) NOT NULL");
            console.log("✅ Column password in 'admin' updated to VARCHAR(255)");
        } catch (e) {
            console.error("❌ Failed to update password column in 'admin':", e.message);
        }

        // 3. Buat tabel reset_password_otp jika belum ada
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS reset_password_otp (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(50) NOT NULL,
                    otp VARCHAR(6) NOT NULL,
                    expired_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("✅ Table 'reset_password_otp' verified/created");
        } catch (e) {
            console.error("❌ Failed to handle 'reset_password_otp' table:", e.message);
        }

        // 4. Cek apakah kolom npm sudah ada di kuota_parkir (Legacy migration)
        const columns = await query("SHOW COLUMNS FROM kuota_parkir LIKE 'npm'");
        if (columns.length === 0) {
            await query("ALTER TABLE kuota_parkir ADD COLUMN npm VARCHAR(50) DEFAULT NULL");
            console.log("✅ Added npm column to 'kuota_parkir'");

            try {
                await query("ALTER TABLE kuota_parkir ADD CONSTRAINT fk_kuota_pengguna FOREIGN KEY (npm) REFERENCES pengguna(npm) ON DELETE CASCADE");
                console.log("✅ Added foreign key constraint to 'kuota_parkir'");
            } catch (e) {
                console.log("ℹ️ Constraint might already exist:", e.message);
            }
        } else {
            console.log("ℹ️ Column npm in 'kuota_parkir' already exists");
        }

        console.log("🚀 Migration successful!");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        process.exit();
    }
}

migrate();

