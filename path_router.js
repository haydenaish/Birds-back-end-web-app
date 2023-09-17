const express = require('express');
const pool = require('./db');
router = express.Router();
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({extended:false}))
router.use(fileUpload())
const path = require('path');

const uploadDirectory = 'public/images/uploads';

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

    

router.post('/birds/create', async (req, res) => {
    
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
    
        const filename = req.files.photo_upload.name
        const photo_file = req.files.photo_upload

    const statusQuery = `SELECT status_id FROM ConservationStatus WHERE status_name = ?;`
    const insertBirdQuery = `INSERT INTO Bird (primary_name, english_name, scientific_name, order_name, family, length, weight, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const insertPhotoQuery = `INSERT INTO Photos (photographer, filename, bird_id) VALUES (?, ?, ?);`;

    const db = pool.promise();

    try {
        const [statusRow] = await db.query(statusQuery, [status_name]);

            const status_id = statusRow[0].status_id;
            // console.log(status_id)

            const [insertedBirdRow] = await db.query(insertBirdQuery, [
                primary_name,
                english_name,
                scientific_name,
                order_name,
                family,
                length,
                weight,
                status_id
            ]);

 
        const bird_id = insertedBirdRow.insertId


        const [insertedPhotoRow] = await db.query(insertPhotoQuery, [
            photographer,
            filename,
            bird_id 
        ]);

        photo_file.mv(path.join(__dirname, 'public/images', filename), (err) => {
            if (err) {
                console.error("Error saving image:", err);
                res.status(500).send("Error saving image.");
                return;
            }
        });
        res.redirect('/birds');
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

router.post('/birds/edit', async (req, res) => {
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

    const bird_id = req.body.bird_id

    // console.log(primary_name)
    // console.log(english_name)
    // console.log(scientific_name)
    // console.log(order_name)
    // console.log(family)
    // console.log(length)
    // console.log(weight)
    // console.log(status_name)
    // console.log(photographer)
    // console.log(bird_id)

    const statusQuery = `SELECT status_id FROM ConservationStatus WHERE status_name = ?;`
    const photographerQuery = `SELECT photographer FROM Photos WHERE bird_id = ?;`
    const updateBirdQuery = `
    UPDATE Bird
    SET
        primary_name = ?,
        english_name = ?,
        scientific_name = ?,
        order_name = ?,
        family = ?,
        length = ?,
        weight = ?,
        status_id = ?
    WHERE
        bird_id = ?;`;

    const db = pool.promise();
    try {
        const [statusRow] = await db.query(statusQuery, [status_name]);

            const status_id = statusRow[0].status_id;
            const values = [
                primary_name,
                english_name,
                scientific_name,
                order_name,
                family,
                length,
                weight,
                status_id,
                bird_id // Replace this with the actual bird ID
            ];
        const [updateResult] = await db.query(updateBirdQuery, values);
        
        // const [photographerRow] = await db.query(photographerQuery, [bird_id]);
        // const photographerName = photographerRow[0].photographer;
    

    

        if(req.files != null){
            const changeFile = `
            UPDATE photos
            SET
            photographer = ?,
            filename = ?
            WHERE
                bird_id = ?;`;
            const filename = req.files.photo_upload.name
            const photo_file = req.files.photo_upload
            const values2 = [
                photographer,
                filename,
                bird_id
                
            ]
            const [updateFile] = await db.query(changeFile, values2)

            photo_file.mv(path.join(__dirname, 'public/images', filename), (err) => {
                if (err) {
                    console.error("Error saving image:", err);
                    res.status(500).send("Error saving image.");
                    return;
                }
            });
        }else{
            const updatePhotographer = `
            UPDATE photos
            SET
            photographer = ?
            WHERE
                bird_id = ?;`;
            const values3 = [
                photographer,
                bird_id
            ]
            const [updatePhoto] = await db.query(updatePhotographer, values3)
        }
        
     } catch (err) {
        console.error('Error updating bird data:', err);
        res.status(500).send('Error updating bird data');
    }

    let filename;
    let photo_file;
    if(req.files != null){
        filename = req.files.photo_upload.name
        photo_file = req.files.photo_upload

    }
    // console.log(filename)
    // console.log(photo_file)

    res.redirect('/birds');
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
        // console.log(bird)
        // console.log(conservation_status_data)
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