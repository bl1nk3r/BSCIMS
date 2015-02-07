var PMS = {};
	PMS.EmpName = "Roy Dlamini";

var doc = db.Employee.insert(PMS),
	query = db.Employee.find();

printjson(query);