module.exports = (sequelize, DataTypes) => {
  return sequelize.define('LogParkir', {
    id_log: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    waktu_masuk: DataTypes.DATE,
    waktu_keluar: DataTypes.DATE,
    status_parkir: DataTypes.STRING(10)
  }, {
    tableName: 'log_parkir',
    timestamps: false
  });
};
