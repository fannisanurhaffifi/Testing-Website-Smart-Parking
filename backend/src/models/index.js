const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('parkir_db', 'root', '', {
  dialect: 'mysql'
});

const Pengguna = require('./Pengguna')(sequelize, DataTypes);
const Admin = require('./admin')(sequelize, DataTypes);
const Kendaraan = require('./kendaraan')(sequelize, DataTypes);
const RFID = null; // Removed
const SlotParkir = require('./slotParkir')(sequelize, DataTypes);
const KuotaParkir = require('./kuotaParkir')(sequelize, DataTypes);
const LogParkir = require('./logParkir')(sequelize, DataTypes);

Pengguna.hasMany(Kendaraan, { foreignKey: 'npm' });
Kendaraan.belongsTo(Pengguna, { foreignKey: 'npm' });

// RFID associations removed

Kendaraan.hasMany(LogParkir, { foreignKey: 'id_kendaraan' });
LogParkir.belongsTo(Kendaraan, { foreignKey: 'id_kendaraan' });

Admin.hasMany(SlotParkir, { foreignKey: 'id_admin' });
Admin.hasMany(KuotaParkir, { foreignKey: 'id_admin' });

KuotaParkir.hasMany(LogParkir, { foreignKey: 'id_kuota' });
LogParkir.belongsTo(KuotaParkir, { foreignKey: 'id_kuota' });

module.exports = {
  sequelize,
  Pengguna,
  Admin,
  Kendaraan,
  SlotParkir,
  KuotaParkir,
  LogParkir
};