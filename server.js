const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect('mongodb+srv://tiagogouveia_db_user:0FlFKhd9ZYia3eNC@testeappsim.vh2y9f3.mongodb.net/?appName=TesteAppSIM')
    .then(() => console.log("MongoDB ligado"))
    .catch(err => console.error("Erro MongoDB:", err));

const deviceSchema = new mongoose.Schema({
    imei: { type: String, required: true, unique: true },
    iccid: String,
    location: String,
    lastUpdate: String
});

const Device = mongoose.model('Device', deviceSchema);

app.post('/device', async (req, res) => {
    try {
        const { imei, iccid, location } = req.body;

        if (!imei) {
            return res.status(400).send("IMEI é obrigatório");
        }

        const lastUpdate = new Date().toISOString();

        await Device.findOneAndUpdate(
            { imei: imei },
            {
                iccid: iccid,
                lastUpdate: lastUpdate,
                ...(location && location !== '' && { location: location })
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        console.log("✅ Atualizado:", imei, lastUpdate);
        res.sendStatus(200);

    } catch (err) {
        console.error("Erro ao guardar:", err);
        res.sendStatus(500);
    }
});

app.get('/devices', async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (err) {
        console.error("Erro ao procurar:", err);
        res.sendStatus(500);
    }
});

app.listen(3000, () => {
    console.log("Servidor a correr na porta 3000");
});