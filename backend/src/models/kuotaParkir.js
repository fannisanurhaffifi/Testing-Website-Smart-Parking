module.exports = (sequelize, DataTypes) => {
  return sequelize.define('KuotaParkir', {
    id_kuota: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    batas_parkir: DataTypes.INTEGER,
    jumlah_terpakai: DataTypes.INTEGER
  }, {
    tableName: 'kuota_parkir',
    timestamps: false
  });
};
