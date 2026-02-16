module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Admin', {
    id_admin: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nama: DataTypes.STRING(50),
    password: DataTypes.STRING(255)
  }, {
    tableName: 'admin',
    timestamps: false
  });
};
