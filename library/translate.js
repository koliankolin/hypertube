const axios = require('axios');
const config = require('config');

async function translate(req, res) {
    const {text, lang_from, lang_to} = req.body;
    try {
        let response = await axios({
            method: 'post',
            url: `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${config.get('translate')}&lang=${lang_from}-${lang_to}`,
            data: `text=${text}`,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        if (response.data.text)
            return res.send({text: response.data.text});
        else
            return ({text: req.body.text});
    } catch (err) {
        if (process.env.MODE === 'DEV')
            console.error(err);
        return res.send({text: req.body.text});
    }
}

module.exports.translate = translate;