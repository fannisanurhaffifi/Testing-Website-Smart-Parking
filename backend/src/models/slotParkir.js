module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SlotParkir', {
    id_slot: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    jumlah: DataTypes.STRING(20)
  }, {
    tableName: 'slot_parkir',
    timestamps: false
  });
};
