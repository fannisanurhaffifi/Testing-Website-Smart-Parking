module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Pengguna', {
    npm: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nama: DataTypes.STRING(50),
    email: DataTypes.STRING(50),
    jurusan: DataTypes.STRING(100),
    prodi: DataTypes.STRING(100),
    angkatan: DataTypes.INTEGER,
    foto: DataTypes.STRING(100),
    password: DataTypes.STRING(255),
    status_akun: DataTypes.BOOLEAN,
    tanggal_daftar: DataTypes.DATE
  }, {
    tableName: 'pengguna',
    timestamps: false
  });
};
