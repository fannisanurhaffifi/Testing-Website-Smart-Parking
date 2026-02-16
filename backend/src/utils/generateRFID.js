let pendingRFID = null;

const setPendingRFID = (id_kendaraan) => {
  pendingRFID = id_kendaraan;
};

const getPendingRFID = () => pendingRFID;

const clearPendingRFID = () => {
  pendingRFID = null;
};

module.exports = {
  setPendingRFID,
  getPendingRFID,
  clearPendingRFID,
};