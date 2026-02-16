module.exports = (sequelize, DataTypes) => {
  return sequelize.define('RFID', {
    id_rfid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    kode_rfid: DataTypes.STRING(50),
    status_rfid: DataTypes.BOOLEAN,
    tanggal_aktif: DataTypes.DATE
  }, {
    tableName: 'rfid',
    timestamps: false
  });
};
