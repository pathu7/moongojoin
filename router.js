const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("./modal");
const checkAuth = require("./auth");
const {
  state,
  dept,
  dis,
  takula,
  city,
  adminUser,
  deptMaster,
} = require("./userExtra");

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Generates a JWT token for authentication.
 *     description: Generates a JWT token using a sample mobile number and ID.
 *     responses:
 *       200:
 *         description: Successful operation. Returns the JWT token.
 */
router.get("/login", (req, res, next) => {
  try {
    const token = jwt.sign({ mobile: "8485943469", ID: 123 }, "imaker", {
      expiresIn: "9h",
    });
    return res.status(200).json(token);
  } catch (error) {
    return res.status(500).json({ err: error });
  }
});

/**
 *
 * @swagger
 * /emp/{id}:
 *   post:
 *     summary: Create or update an employee
 *     description: Create a new employee if ID is 0, or update an existing employee if ID is provided.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the employee. Provide 0 to create a new employee.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the employee.
 *               mobile:
 *                 type: string
 *                 description: Mobile number of the employee.
 *               alt_number:
 *                 type: string
 *                 description: Alternative mobile number of the employee.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the employee.
 *               address:
 *                 type: string
 *                 description: Address of the employee.
 *               home_address:
 *                 type: string
 *                 description: Home address of the employee.
 *               dept:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dept_id:
 *                       type: string
 *                       description: ID of the department.
 *                     subdept:
 *                       type: string
 *                       description: Sub-department of the employee.
 *                     post:
 *                       type: string
 *                       description: Post of the employee within the department.
 *               state:
 *                 type: string
 *                 description: ID of the state.
 *               city:
 *                 type: string
 *                 description: ID of the city.
 *               dis:
 *                 type: string
 *                 description: ID of the district.
 *               takula:
 *                 type: string
 *                 description: ID of the taluka.
 *             required:
 *               - name
 *               - mobile
 *               - email
 *               - address
 *               - dept
 *               - state
 *               - city
 *               - dis
 *               - takula
 *     responses:
 *       200:
 *         description: Successful operation. Employee created or updated successfully.
 *       500:
 *         description: Internal server error.
 */
router.post("/emp/:id", checkAuth, async (req, res, next) => {
  try {
    if (req.params.id == 0) {
      const user = await new User(req.body);
      user
        .save()
        .then((result) => {
          if (result._id) {
            req.body.dept.map(async (item) => {
              item.user_id = result._id;
              await new deptMaster(item).save();
            });
            return res.status(200).json();
          }
        })
        .catch((err) => {
          return res.status(500).json();
        });
    } else {
      User.findByIdAndUpdate(req.params.id, req.body)
        .then((result) => {
          if (result) {
            req.body.dept.map((item) => {
              deptMaster.deleteOne({ _id: item._id });
              deptMaster.findByIdAndUpdate(item._id, item);
            });
          }
          return res.status(200).json();
        })
        .catch((err) => {
          return res.status(500).json();
        });
    }
  } catch (error) {
    return res.status(500).json({ err: error });
  }
});

/**
 * @swagger
 * /empdetail/{id}:
 *   get:
 *     summary: Retrieve employee details by ID
 *     description: Retrieve details of an employee by their unique ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the employee to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful operation. Employee details retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID.
 *                 name:
 *                   type: string
 *                   description: Name of the employee.
 *                 email:
 *                   type: string
 *                   description: Email address of the employee.
 *                 alt_number:
 *                   type: string
 *                   description: Alternative mobile number of the employee.
 *                 mobile:
 *                   type: string
 *                   description: Mobile number of the employee.
 *                 address:
 *                   type: string
 *                   description: Address of the employee.
 *                 home_address:
 *                   type: string
 *                   description: Home address of the employee.
 *                 dept:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Department master ID.
 *                       subdept:
 *                         type: string
 *                         description: Sub-department of the employee within the department.
 *                       post:
 *                         type: string
 *                         description: Post of the employee within the department.
 *       404:
 *         description: Employee with the provided ID not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/empdetail/:id", checkAuth, (req, res, next) => {
  try {
    User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "deptmasters",
          localField: "_id",
          foreignField: "user_id",
          as: "dept",
        },
      },
    ])
      .then((result) => {
        return res.status(200).json(result[0]);
      })
      .catch((error) => {
        return res.status(404).json({ err: error });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
});

/**
 * @swagger
 * /empdetails:
 *   get:
 *     summary: Retrieve employee details
 *     description: Retrieve details of employees based on provided query parameters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search for employees by name, email, or mobile number (supports regex).
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State ID to filter employees by state.
 *       - in: query
 *         name: dis
 *         schema:
 *           type: string
 *         description: District ID to filter employees by district.
 *       - in: query
 *         name: dept
 *         schema:
 *           type: string
 *         description: Department ID to filter employees by department.
 *     responses:
 *       200:
 *         description: Successful operation. Employee details retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: User ID.
 *                   name:
 *                     type: string
 *                     description: Name of the employee.
 *                   email:
 *                     type: string
 *                     description: Email address of the employee.
 *                   alt_number:
 *                     type: string
 *                     description: Alternative mobile number of the employee.
 *                   mobile:
 *                     type: string
 *                     description: Mobile number of the employee.
 *                   address:
 *                     type: string
 *                     description: Address of the employee.
 *                   home_address:
 *                     type: string
 *                     description: Home address of the employee.
 *                   state_name:
 *                     type: string
 *                     description: Name of the state.
 *                   dis_name:
 *                     type: string
 *                     description: Name of the district.
 *                   taluko_name:
 *                     type: string
 *                     description: Name of the taluko (sub-district).
 *                   city_name:
 *                     type: string
 *                     description: Name of the city.
 *                   dept:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: Department master ID.
 *                         subdept:
 *                           type: string
 *                           description: Sub-department of the employee within the department.
 *                         post:
 *                           type: string
 *                           description: Post of the employee within the department.
 *                         dept_id:
 *                           type: string
 *                           description: ID of the department.
 */
router.get("/empdetails", checkAuth, async (req, res, next) => {
  try {
    const totalPage = await User.countDocuments().exec();
    User.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: req.query.name } },
            { email: { $regex: req.query.name } },
            { mobile: { $regex: req.query.name } },
          ],
        },
      },
      { $match: { state: new mongoose.Types.ObjectId(req.query.state) } },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state",
        },
      },
      {
        $match: {
          dis: req.query.dis
            ? new mongoose.Types.ObjectId(req.query.dis)
            : { $exists: true },
        },
      },
      {
        $lookup: {
          from: "dis",
          localField: "dis",
          foreignField: "_id",
          as: "dis",
        },
      },
      {
        $lookup: {
          from: "takulas",
          localField: "takula",
          foreignField: "_id",
          as: "taluko",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $lookup: {
          from: "deptmasters",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "depts",
                localField: "dept_id",
                foreignField: "_id",
                as: "depts",
              },
            },
            {
              $match: {
                dept_id: req.query.dept
                  ? new mongoose.Types.ObjectId(req.query.dept)
                  : { $exists: true },
              },
            },
            {
              $project: {
                _id: 1,
                subdept: 1,
                post: 1,
                dept_id: 1,
                depts: { $ifNull: [{ $arrayElemAt: ["$depts.name", 0] }, ""] },
              },
            },
          ],
          as: "deptmasters",
        },
      },
      { $match: { deptmasters: { $exists: true, $ne: [] } } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          alt_number: 1,
          mobile: 1,
          address: 1,
          home_address: 1,
          state_name: { $ifNull: [{ $arrayElemAt: ["$state.name", 0] }, ""] },
          dis_name: { $ifNull: [{ $arrayElemAt: ["$dis.name", 0] }, ""] },
          taluko_name: { $ifNull: [{ $arrayElemAt: ["$taluko.name", 0] }, ""] },
          city_name: { $ifNull: [{ $arrayElemAt: ["$city.name", 0] }, ""] },
          dept: "$deptmasters",
        },
      },
      { $skip: (req.query.page - 1) * 10 },
      { $limit: 10 },
    ])
      .then((user) => {
        console.log(totalPage);
        return res.status(200).json(user);
      })
      .catch((error) => {
        return res.status(404).json({ err: error });
      });
  } catch (error) {
    return res.status(500).json({ err: error });
  }
});

/**
 * @swagger
 * /empDetails/{id}:
 *   get:
 *     summary: Retrieve employee details by ID
 *     description: Retrieve details of an employee by their unique ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the employee to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful operation. Employee details retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID.
 *                 name:
 *                   type: string
 *                   description: Name of the employee.
 *                 email:
 *                   type: string
 *                   description: Email address of the employee.
 *                 alt_number:
 *                   type: string
 *                   description: Alternative mobile number of the employee.
 *                 mobile:
 *                   type: string
 *                   description: Mobile number of the employee.
 *                 address:
 *                   type: string
 *                   description: Address of the employee.
 *                 home_address:
 *                   type: string
 *                   description: Home address of the employee.
 *                 state_name:
 *                   type: string
 *                   description: Name of the state.
 *                 dis_name:
 *                   type: string
 *                   description: Name of the district.
 *                 taluko_name:
 *                   type: string
 *                   description: Name of the taluko (sub-district).
 *                 city_name:
 *                   type: string
 *                   description: Name of the city.
 *                 dept:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Department master ID.
 *                       subdept:
 *                         type: string
 *                         description: Sub-department of the employee within the department.
 *                       post:
 *                         type: string
 *                         description: Post of the employee within the department.
 *                       depts:
 *                         type: string
 *                         description: Name of the department.
 *       404:
 *         description: Employee with the provided ID not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/empDetails/:id", checkAuth, (req, res, next) => {
  try {
    User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "deptmasters",
          localField: "_id",
          foreignField: "user_id",
          pipeline: [
            {
              $lookup: {
                from: "depts",
                localField: "dept_id",
                foreignField: "_id",
                as: "depts",
              },
            },
            {
              $project: {
                _id: 1,
                subdept: 1,
                post: 1,
                depts: { $ifNull: [{ $arrayElemAt: ["$depts.name", 0] }, ""] },
              },
            },
          ],
          as: "deptmasters",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "state",
          foreignField: "_id",
          as: "state",
        },
      },
      {
        $lookup: {
          from: "dis",
          localField: "dis",
          foreignField: "_id",
          as: "dis",
        },
      },
      {
        $lookup: {
          from: "takulas",
          localField: "takula",
          foreignField: "_id",
          as: "taluko",
        },
      },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          alt_number: 1,
          mobile: 1,
          address: 1,
          home_address: 1,
          state_name: { $ifNull: [{ $arrayElemAt: ["$state.name", 0] }, ""] },
          dis_name: { $ifNull: [{ $arrayElemAt: ["$dis.name", 0] }, ""] },
          taluko_name: { $ifNull: [{ $arrayElemAt: ["$taluko.name", 0] }, ""] },
          city_name: { $ifNull: [{ $arrayElemAt: ["$city.name", 0] }, ""] },
          dept: "$deptmasters",
        },
      },
    ])
      .then((result) => {
        return res.status(200).json(result[0]);
      })
      .catch((error) => {
        return res.status(404).json({ err: error });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: error });
  }
});

/**
 * @swagger
 * /empDetails/{id}:
 *   get:
 *     summary: Retrieve employee details by ID
 *     description: Retrieve details of an employee by their unique ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the employee to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful operation. Employee details retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: User ID.
 *                 name:
 *                   type: string
 *                   description: Name of the employee.
 *                 email:
 *                   type: string
 *                   description: Email address of the employee.
 *                 alt_number:
 *                   type: string
 *                   description: Alternative mobile number of the employee.
 *                 mobile:
 *                   type: string
 *                   description: Mobile number of the employee.
 *                 address:
 *                   type: string
 *                   description: Address of the employee.
 *                 home_address:
 *                   type: string
 *                   description: Home address of the employee.
 *                 state_name:
 *                   type: string
 *                   description: Name of the state.
 *                 dis_name:
 *                   type: string
 *                   description: Name of the district.
 *                 taluko_name:
 *                   type: string
 *                   description: Name of the taluko (sub-district).
 *                 city_name:
 *                   type: string
 *                   description: Name of the city.
 *                 dept:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Department master ID.
 *                       subdept:
 *                         type: string
 *                         description: Sub-department of the employee within the department.
 *                       post:
 *                         type: string
 *                         description: Post of the employee within the department.
 *                       depts:
 *                         type: string
 *                         description: Name of the department.
 *       404:
 *         description: Employee with the provided ID not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/empdelete/:id", checkAuth, (req, res, next) => {
  User.deleteOne({ _id: req.params.id })
    .exec()
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

/**
 * @swagger
 * /empdetail:
 *   post:
 *     summary: Retrieve employee details
 *     description: Retrieve details of an employee using the employee name and district ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the employee.
 *               dis_id:
 *                 type: string
 *                 description: District ID.
 *               key:
 *                 type: string
 *                 description: Key parameter used for additional identification (e.g., state, department, city).
 *     responses:
 *       200:
 *         description: Successful operation. Employee details retrieved.
 *       500:
 *         description: Internal server error.
 */
router.post("/empdetail", checkAuth, async (req, res, next) => {
  const Model = mongoose.model(req.body.key);
  const user = await new Model(req.body);
  user
    .save()
    .then((result) => {
      return res.status(200).json();
    })
    .catch((err) => {
      return res.status(500).json();
    });
});

/**
 * @swagger
 * /emplist/{id}:
 *   get:
 *     summary: Retrieve list of items by model ID
 *     description: Retrieve a list of items from the specified model by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the model to retrieve items from.
 *     responses:
 *       200:
 *         description: Successful operation. List of items retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Details of the retrieved item.
 *       500:
 *         description: Internal server error.
 */
router.get("/emplist/:id", checkAuth, (req, res, next) => {
  const Model = mongoose.model(req.params.id);
  Model.find()
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

/**
 * @swagger
 * /emplistfilter:
 *   get:
 *     summary: Retrieve filtered list of items by model and criteria
 *     description: Retrieve a filtered list of items from the specified model based on provided criteria.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Model key to identify the model.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the field in the model to filter by.
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID to filter by (should be a valid ObjectID).
 *     responses:
 *       200:
 *         description: Successful operation. Filtered list of items retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Details of the retrieved item.
 *       500:
 *         description: Internal server error.
 */
router.get("/emplistfilter", checkAuth, (req, res, next) => {
  try {
    const Model = mongoose.model(req.query.key);
    Model.aggregate([
      {
        $match: { [req.query.name]: new mongoose.Types.ObjectId(req.query.id) },
      },
    ])
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((error) => {
        return res.status(500).json({ err: error });
      });
  } catch (error) {
    return res.status(500).json({ err: error });
  }
});

module.exports = router;
