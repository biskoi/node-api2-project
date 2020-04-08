const express = require('express')
const server = express();
const port = 5000
const db = require('./data/db')

server.use(express.json());

server.listen(port, () => {
console.log(`Server listening on port ${port}`)
});

server.get('/api/posts', (req, res) => {
   db.find()
   .then(posts => {
      res.status(200).json(posts)
   })
   .catch(err => {
      res.status(500).json({
         error: 'Could not retrieve posts'
      })
   });
});

server.post('/api/posts', (req, res) => {
   
   const post = req.body;

   if (!req.body.title || !req.body.contents) {
      res.status(400).json({
         errorMessage: 'Submitted post must contain a title and text.'
      });
   } else {
      db.insert(post)
      .then(reply => {
         res.status(201).json(reply) // Currently returning the ID of the newly created post
      })
      .catch(err => {
         res.status(500).json({
            error: 'There was an error while saving the post.'
         })
      });
   }
   
});

server.get('/api/posts/:id', (req, res) => {

   const id = req.params.id;

   db.findById(id)
   .then(post => {
      console.log(post);
      // if (post[0].id != id) {
      if (post.length === 0) {
         res.status(404).json({
            message: `Post ID ${id} does not exist.`
         });
      } else {
         res.status(200).json(post[0]); // returns the object instead of an array to conform with returns
      };
   })
   .catch(err => {
      res.status(500).json({
         message: `Error: ${err}`
      })
   });

});

server.put('/api/posts/:id', (req, res) => { // args are (id, object) returns count of updated items

   const id = req.params.id;

   if(!req.body.title || !req.body.contents) {
      return res.status(400).json({
         message: 'Please include both the title and contents.'
      })
   };

   db.findById(id)
   .then(item => {

      if (item.length !== 0) {
      
         db.update(id, req.body)
         .then(count => {
            if (count !== 0) {
               res.status(201).json(item[0])
            }
         })
         .catch(err => {
            res.status(500).json({
               message: err
            })
         });
   
      } else {
         res.status(404).json({
            message: `Could not find post ID ${id}`
         });
      };

   })
   .catch(err => {
      res.status(500).json({
         message: err
      })
   });

}); 

server.delete('/api/posts/:id', (req, res) => {

   const id = req.params.id;

   db.findById(id)
   .then(item => {
      if (item.length === 0) {
         res.status(404).json({
            message: `Post ID ${id} could not be found.`
         });
      };
   })
   .catch(err => {
      res.status(500).json({
         message: err
      })
   });

   db.remove(id)
   .then(rep => {
      res.status(200).json({
         message: `Deleted ${rep} item(s).`
      })  // returns count of updated items
   })
   .catch(err => {
      res.status(500).json({
         message: `The post could not be removed. Error: ${err}`
      })
   });

});

server.get('/api/posts/:id/comments', (req, res) => {

   const id = req.params.id;

   db.findById(id)
   .then(item => {
      if (item.length === 0) {
         res.status(404).json({
            message: `Post ID ${id} could not be found.`
         });
      };
   })
   .catch(err => {
      res.status(500).json({
         message: err
      })
   });

   db.findPostComments(id)
   .then(rep => {
      res.status(200).json(rep)
   })
   .catch(err => {
      res.status(500).json({
         message: err
      })
   });

});

server.post('/api/posts/:id/comments', (req, res) => {

   const id = req.params.id
   // const newComment = {
   //    post_id: id,
   //    text: req.body.text
   // }

   // Fix it so client doesnt have to send a post id, grabbing it from params instead

   if (!req.body.text) {
      res.status(400).json({
         message: `Please include your comment text.`
      })
   }

   db.findById(id)
   .then(item => {
      console.log(item)
      if (item.length === 0) {
         res.status(404).json({
            message: `Post ID ${id} could not be found.`
         });
      };
   })
   .catch(err => {
      res.status(500).json({
         message: err
      })
   });

   db.insertComment(req.body)
   .then(rep => {

      db.findCommentById(rep.id)
      .then(item => {
         res.status(201).json(item)
      })
      .catch(err => {
         res.status(500).json({
            message: err
         })
      });

   })
   .catch(err => {
      res.status(500).json({
         message: `There was an error saving your comment. ${err}`
      })
   });

});