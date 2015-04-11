db.Division.update({"DivName": "Finance"}, {$push: {"Department": [
																	{"DepName": "Financial Accounting", "DepManager": "Ransford Quaynor", 
																	"Section": [
																				{"SecName": "Accountant Treasury", "SecHead": "T. Masina", "NumEmp": 6, "Employee": [
																																									{"EmpName": "Happy Ndlela", "PFNum": 755, "Gender": "F", "Email": "happy.ndlela@sec.co.sz", "Position": "Assistant Accountant Treasury"}, 
																																									{"EmpName": "Thandeka Malaza", "PFNum": 852, "Gender": "F", "Email": "thandeka.malaza@sec.co.sz", "Position": "Assistant Accountant Ledgers"}, 
																																									{"EmpName": "Gugu Magagula", "PFNum": 1223, "Gender": "F", "Email": "gugu.magagula@sec.co.sz", "Position": "Accounts Officer Ledger"}, 
																																									{"EmpName": "Thembi Dlamini", "PFNum": 699, "Gender": "F", "Email": "thembi.dlamini@sec.co.sz", "Position": "Accounts Officer Ledger"}
																																									]}, 
																				{"SecName": "Accountant Payroll", "SecHead": "Lungile Nyoni", "NumEmp": 1, "Employee": [
																																										{"EmpName": "Thuli Mamba", "PFNum": 1496, "Gender": "F", "Email": "thuli.mamba@sec.co.sz", "Position": "Assistant Accountant Payroll"}
																																										]},
																				{"SecName": "Accountant Operations", "SecHead": "Phinda Dlamini", "NumEmp": 1, "Employee": [{}] }
																				]
																	}]
													}
											});
