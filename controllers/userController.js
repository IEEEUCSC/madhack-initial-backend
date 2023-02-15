import sql from "mssql";

export const registerUser = (req, res) => {
  try {
    let request = new sql.Request();
    request.input("team_id", req.get("teamToken"));
    request.query('SELECT COUNT(*) from app_user WHERE team_id=@team_id AND email=@email', (err, recordset) => {
      if (err) console.log(err);
      if (recordset[0].count <= 0) {
        let request = new sql.Request();
        request.input("first_name", req.body("firstName"));
        request.input("last_name", req.body("lastName"));
        request.input("email", req.body("email"));
        request.input("password", req.body("password"));
        request.input("contact_no", req.body("contactNo"));
        request.input("profile_picture", req.get("profilePicture"));

        request.query('INSERT INTO app_user (first_name, last_name, email, password, contact_no, profile_picture) VALUES (@first_name, @last_name, @email, @password, @contact_no, @profile_picture)', (err, recordset) => {
          if (err) console.log(err);
          res.status(200).json({"message": "User registered successfully"});
        });
      } else {
        res.status(400).json({"message": "User already exists"});
      }
    });
  } catch (error) {
    console.log(error);
  }
};
