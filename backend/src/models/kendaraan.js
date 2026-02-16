module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Kendaraan', {
    id_kendaraan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    plat_nomor: DataTypes.STRING(10),
    jenis_kendaraan: DataTypes.BOOLEAN,
    stnk: DataTypes.STRING
  }, {
    tableName: 'kendaraan',
    timestamps: false
  });
};
