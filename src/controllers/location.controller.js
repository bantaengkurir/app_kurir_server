const { location: LocationModel, user: UserModel } = require("../models");
const axios = require("axios");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */

const index = async(req, res, _next) => {
    try {
        const locations = await LocationModel.findAll();
        return res.send({
            message: "Success",
            data: locations,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

const reverseGeocode = async(latitude, longitude) => {
    const apiKey = process.env.API_KEY_GEOCODING_MAPS; // Gantilah dengan API Key Google Maps Anda
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }
        throw new Error('Alamat tidak ditemukan');
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        throw new Error('Terjadi kesalahan saat mengambil alamat');
    }
};

const create = async(req, res) => {
    const { latitude, longitude } = req.body;
    const currentUser = req.user;

    // Validasi input
    if (!latitude || !longitude) {
        return res.status(400).send({ message: "Latitude dan Longitude wajib diisi" });
    }

    if (!currentUser || !currentUser.id) {
        return res.status(401).send({ message: "User tidak terautentikasi" });
    }

    try {
        // Ambil alamat berdasarkan latitude dan longitude
        const address = await reverseGeocode(latitude, longitude);

        // Cek apakah pengguna sudah memiliki alamat
        const user = await UserModel.findByPk(currentUser.id);

        let location;

        if (!user.address) {
            // Jika alamat pengguna masih kosong, buat lokasi baru
            location = await LocationModel.create({
                user_id: currentUser.id,
                latitude,
                longitude,
                address,
            });

            // Memperbarui alamat pengguna di tabel User
            await UserModel.update({
                address: address,
            }, {
                where: {
                    id: currentUser.id,
                },
            });

            return res.send({
                message: "Location berhasil dibuat",
                data: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address,
                },
            });
        } else {
            // Jika alamat sudah ada, perbarui lokasi yang ada
            location = await LocationModel.findOne({
                where: { user_id: currentUser.id }
            });

            if (location) {
                // Update lokasi yang ada
                await LocationModel.update({
                    latitude,
                    longitude,
                    address,
                }, {
                    where: { user_id: currentUser.id }
                });
            } else {
                // Jika tidak ditemukan lokasi, buat baru (seharusnya tidak terjadi)
                location = await LocationModel.create({
                    user_id: currentUser.id,
                    latitude,
                    longitude,
                    address,
                });
            }

            // Memperbarui alamat pengguna di tabel User
            await UserModel.update({
                address: address,
            }, {
                where: {
                    id: currentUser.id,
                },
            });

            return res.send({
                message: "Location berhasil diperbarui",
                data: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address,
                },
            });
        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: error.message });
    }
};



module.exports = { index, create };