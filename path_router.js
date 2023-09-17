const express = require('express');
const pool = require('./db');
router = express.Router();
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended:false}))

router.get('/', async (req, res) => {
    res.redirect('/birds')
});


router.get('/birds', async (req, res) => {
    conservation_status_data = []
    birds = []

    /* conservation status from mysql */
    const db = pool.promise();
    const query = `SELECT * FROM ConservationStatus;`
    // const birds_query = `Select * From Bird;`
    // const birds_query = `select * from ConservationStatus inner join bird on bird.status_id = ConservationStatus.status_id inner join photos on photos.bird_id = bird.bird_id;`
    const birds_query = 'select * from bird inner join conservationstatus on conservationstatus.status_id = bird.status_id inner join photos on photos.bird_id = bird.bird_id order by bird.bird_id'
    try {
        const [rows, fields] = await db.query(query);
        conservation_status_data = rows;
        const[birdrow, field] = await db.query(birds_query);
        birds = birdrow;


    } catch (err) {
        console.error("Error with code you have just implemented");
    }    
    /* bind data to the view (index.ejs) */
    res.render('index', { title: 'Birds of Aotearoa', birds: birds, status: conservation_status_data });
});

router.get('/birds/create/', async (req, res) =>{
    conservation_status_data = []
    const db = pool.promise();
    const query = `SELECT * FROM ConservationStatus;`
    try {
        const [status_row, status_field] = await db.query(query);
        conservation_status_data = status_row;
    } catch (err) {
        console.error("Error with code you have just implemented");
    }

    res.render('create',{title: "Create A Bird", status:conservation_status_data})
})


    

router.post('/birds/create', (req, res) => {
    // const primary_name = req.bo
    
    const {
        primary_name,
        english_name,
        scientific_name,
        order_name,
        family,
        length,
        weight,
        status_name,
        photographer,
        } = req.body;


        console.log(primary_name)
        console.log(english_name)
        console.log(scientific_name)
        console.log(order_name)
        console.log(family)
        console.log(length)
        console.log(weight)
        console.log(photographer)
        // res.redirect('/birds');
    // });

    const statusQuery = `SELECT status_id FROM ConservationStatus WHERE status_name = ?;`
    const insertBirdQuery = `INSERT INTO Bird (primary_name, english_name, scientific_name, order_name, family, length, weight, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const insertPhotoQuery = `INSERT INTO Photos (photographer, filename, bird_id) VALUES (?, ?, ?);`;

    const db = pool.promise();

    try {
        // Insert bird data into the Birds table
        const [statusRow] = db.query(statusQuery, [status_name]);

        if (statusRow.length === 1) {
            const status_id = statusRow[0].status_id;

            const [insertedBirdRow] = db.query(insertBirdQuery, [
                primary_name,
                english_name,
                scientific_name,
                order_name,
                family,
                length,
                weight,
                status_id // Use the status_id
            ]);

        // Insert photo data into the Photos table
        const [insertedPhotoRow] = db.query(insertPhotoQuery, [
            photographer,
            photo_source, // Assuming photo_source is the filename
            insertedBirdRow.insertId // Use the ID of the newly inserted bird
        ]);
        
        } else {
            console.error(`Status with name ${status_name} not found.`);
            res.status(404).send('Status not found');
        }

        res.redirect('/birds'); // Redirect to a page after successful submission
    } catch (err) {
        console.error('Error inserting bird data:', err);
        res.status(500).send('Error inserting bird data');
    }
});

router.get('/birds/:id', async (req, res) => {
    const id = req.params.id;
    conservation_status_data = []
    bird = []


    /* conservation status from mysql */
    const db = pool.promise();
    const query = `SELECT * FROM ConservationStatus;`
    const birds_query = 'select * from bird inner join conservationstatus on conservationstatus.status_id = bird.status_id inner join photos on photos.bird_id = bird.bird_id where bird.bird_id like ?'
    // const birds_query = `select * from ConservationStatus inner join bird on bird.status_id = ConservationStatus.status_id inner join photos on photos.bird_id = bird.bird_id where bird.bird_id like ?;`
    try {
        const [status_row, status_field] = await db.query(query);
        conservation_status_data = status_row;
        const [bird_rows, bird_fields] = await db.query(birds_query, id);
        bird = bird_rows
        // console.log(bird)
    } catch (err) {
        console.error("Error with code you have just implemented");
        
    }
    if(bird.length ===0){
        // res.status(404).render('404-page', { title: '404 - Not Found' });
        res.status(404)
        res.render('404-page', {title: 'Did you get lost??'})
    }

    res.render('bird_page', {title: "Birds of Aotearoa", bird: bird[0], status: conservation_status_data});
})

router.get('/birds/:id/upload', async (req, res) => {
    const id = req.params.id;
    conservation_status_data = []
    bird = []


    /* conservation status from mysql */
    const db = pool.promise();
    const query = `SELECT * FROM ConservationStatus;`
    const birds_query = 'select * from bird inner join conservationstatus on conservationstatus.status_id = bird.status_id inner join photos on photos.bird_id = bird.bird_id where bird.bird_id like ?'
    // const birds_query = `select * from ConservationStatus inner join bird on bird.status_id = ConservationStatus.status_id inner join photos on photos.bird_id = bird.bird_id where bird.bird_id like ?;`
    try {
        const [status_row, status_field] = await db.query(query);
        conservation_status_data = status_row;
        const [bird_rows, bird_fields] = await db.query(birds_query, id);
        bird = bird_rows
    } catch (err) {
        console.error("Error with code you have just implemented");
    }
    if(bird.length ===0){
        res.status(404).render('404-page', { title: '404 - Not Found' });
    }

    res.render('edit', {title: "Birds of Aotearoa", bird: bird[0], status: conservation_status_data});
})

router.get('/birds/:id/delete', async (req, res)=>{
    const id = req.params.id;
    const photo_query = 'delete from photos where bird_id = ?;'
    // const deletePhotosQuery = `DELETE FROM Photos WHERE bird_id = ?;`
    const bird_query = 'delete from bird where bird_id = ?'
    const db = pool.promise();

    try{
        await db.query(photo_query, id)
        await db.query(bird_query, id)
    }catch{
        console.error("Error with code you have just implemented");
    }

        res.redirect('/birds');
})


router.get('*', (request, response) =>{
    response.status(404)
    response.render('404-page', {title: 'Did you get lost??'})
})

module.exports = router;