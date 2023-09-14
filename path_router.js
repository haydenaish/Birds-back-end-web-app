const express = require('express');
const pool = require('./db');
router = express.Router();

router.get('/', async (req, res) => {
    res.redirect('/birds')
});

router.get('/birds', async (req, res) => {
    conservation_status_data = []
    birds = []

    /* conservation status from mysql */
    const db = pool.promise();
    const status_query = `SELECT * FROM ConservationStatus;`
    const birds_query = `Select * From Bird;`
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;
        // console.log(conservation_status_data)
        const[birdrow, field] = await db.query(birds_query);
        birds = birdrow;
        // console.log(birds)
        for(let i=0; i<birds.length; i ++){
            const photo_query = `Select * from photos where bird_id = ?;`
            const [photo_rows, fields] = await db.query(photo_query, birds[i].bird_id);
            // photo = photo_rows
            birds[i].images = photo_rows;
            // console.log(photo_rows)
            const status_query = `select * from ConservationStatus inner join bird on bird.status_id = ConservationStatus.status_id where bird.bird_id = ?;`
            const [statusRows, statusFields] = await db.query(status_query, birds[i].bird_id);
            birds[i].status = statusRows;
            // console.log(birds[i].status)
            // console.log(birds[i].images)
            
        }
    } catch (err) {
        console.error("Error with code you have just implemented");
    }
    
    /* REPLACE THE .json WITH A MYSQL DATABASE */
    // const birds = require('./sql/nzbird.json');
    
    /* bind data to the view (index.ejs) */
    res.render('index', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
});


module.exports = router;