/**
 * ============================================================================
 * FICTITIOUS SAMPLE VOTER RECORDS (FOR LOCAL TESTING ONLY)
 * ============================================================================
 * IMPORTANT:
 * - All records in this file are 100% fictitious sample data created to test:
 *   1. Hindi & English name search
 *   2. Partial name matching & similar/duplicate names
 *   3. Relative's Hindi & English name search
 *   4. Ward filtering & combined filters (Gender, Relationship Type)
 *   5. Serial number & optional Voter ID search
 *   6. Missing optional fields handling
 *   7. Pagination / Load More functionality
 * - These records are ONLY used when GOOGLE_SHEETS_MODE=SAMPLE.
 * - When you switch GOOGLE_SHEETS_MODE=GOOGLE_SHEETS_API, this file is completely
 *   bypassed and never mixed with your real production data.
 * ============================================================================
 */

export const SAMPLE_HEADERS = [
  "Ward Number",
  "Serial Number",
  "Voter ID / EPIC Number",
  "Name in Hindi",
  "Name in English",
  "Relationship Type",
  "Relative’s Name in Hindi",
  "Relative’s Name in English",
  "House Number",
  "Age",
  "Gender"
];

export const SAMPLE_ROWS = [
  // Ward 1 - Similar names ("राजेश शर्मा" / "Rajesh Sharma") to test multiple matching results
  ["1", "101", "TST100001", "राजेश शर्मा", "Rajesh Sharma", "पिता का नाम", "मोहन लाल शर्मा", "Mohan Lal Sharma", "अ-12", "45", "पुरुष"],
  ["1", "102", "TST100002", "सुनीता शर्मा", "Sunita Sharma", "पति का नाम", "राजेश शर्मा", "Rajesh Sharma", "अ-12", "41", "महिला"],
  ["1", "103", "TST100003", "राजेश कुमार शर्मा", "Rajesh Kumar Sharma", "पिता का नाम", "गोपाल शर्मा", "Gopal Sharma", "अ-19", "32", "पुरुष"],
  ["1", "104", "TST100004", "कविता देवी", "Kavita Devi", "पति का नाम", "दिनेश कुमार", "Dinesh Kumar", "अ-24", "29", "महिला"],
  ["1", "105", "TST100005", "अमित कुमार वर्मा", "Amit Kumar Verma", "पिता का नाम", "सोहन लाल वर्मा", "Sohan Lal Verma", "अ-30", "24", "पुरुष"],

  // Ward 2 - Testing varied relationships, ages, and partial matches
  ["2", "201", "TST200001", "रामस्वरूप मीणा", "Ramswaroop Meena", "पिता का नाम", "कल्याण सहाय मीणा", "Kalyan Sahay Meena", "बी-04", "58", "पुरुष"],
  ["2", "202", "TST200002", "गीता देवी मीणा", "Geeta Devi Meena", "पति का नाम", "रामस्वरूप मीणा", "Ramswaroop Meena", "बी-04", "54", "महिला"],
  ["2", "203", "TST200003", "विकास मीणा", "Vikas Meena", "पिता का नाम", "रामस्वरूप मीणा", "Ramswaroop Meena", "बी-04", "27", "पुरुष"],
  ["2", "204", "TST200004", "प्रियंका मीणा", "Priyanka Meena", "माता का नाम", "गीता देवी मीणा", "Geeta Devi Meena", "बी-04", "22", "महिला"],
  ["2", "205", "TST200005", "महेन्द्र सिंह राठौड़", "Mahendra Singh Rathore", "पिता का नाम", "लक्ष्मण सिंह राठौड़", "Laxman Singh Rathore", "बी-15", "39", "पुरुष"],

  // Ward 3 - Testing missing optional fields (missing House Number, missing English relative name, etc.)
  ["3", "301", "TST300001", "शांति बाई", "Shanti Bai", "पति का नाम", "भंवर लाल", "Bhanwar Lal", "सी-08", "67", "महिला"],
  ["3", "302", "", "सुरेश चन्द्र जांगिड़", "Suresh Chandra Jangid", "पिता का नाम", "रामचंद्र जांगिड़", "Ramchandra Jangid", "", "49", "पुरुष"],
  ["3", "303", "TST300003", "अनीता जांगिड़", "Anita Jangid", "पति का नाम", "सुरेश चन्द्र जांगिड़", "", "सी-11", "44", "महिला"],
  ["3", "304", "TST300004", "रोहित जांगिड़", "Rohit Jangid", "पिता का नाम", "सुरेश चन्द्र जांगिड़", "Suresh Chandra Jangid", "सी-11", "21", "पुरुष"],
  ["3", "305", "TST300005", "पूजा कुमारी", "Pooja Kumari", "पिता का नाम", "कैलाश चन्द", "Kailash Chand", "सी-22", "19", "महिला"],

  // Ward 4 - Testing Unicode normalization (nuqta/bindu/chandrabindu variations) and similar surnames
  ["4", "401", "TST400001", "देवेन्द्र कुमार यादव", "Devendra Kumar Yadav", "पिता का नाम", "हरिराम यादव", "Hariram Yadav", "डी-01", "36", "पुरुष"],
  ["4", "402", "TST400002", "मंजू यादव", "Manju Yadav", "पति का नाम", "देवेन्द्र कुमार यादव", "Devendra Kumar Yadav", "डी-01", "33", "महिला"],
  ["4", "403", "TST400003", "संदीप यादव", "Sandeep Yadav", "पिता का नाम", "हरिराम यादव", "Hariram Yadav", "डी-02", "28", "पुरुष"],
  ["4", "404", "TST400004", "रेखा देवी", "Rekha Devi", "पति का नाम", "संदीप यादव", "Sandeep Yadav", "डी-02", "25", "महिला"],
  ["4", "405", "TST400005", "ओमप्रकाश कुमावत", "Omprakash Kumawat", "पिता का नाम", "जगदीश कुमावत", "Jagdish Kumawat", "डी-14", "52", "पुरुष"],

  // Ward 5 - Additional records to demonstrate pagination / Load More (25 total sample records)
  ["5", "501", "TST500001", "अब्दुल करीम", "Abdul Kareem", "पिता का नाम", "अब्दुल रहमान", "Abdul Rehman", "ई-07", "61", "पुरुष"],
  ["5", "502", "TST500002", "सलमा बानो", "Salma Bano", "पति का नाम", "अब्दुल करीम", "Abdul Kareem", "ई-07", "56", "महिला"],
  ["5", "503", "TST500003", "इरफान खान", "Irfan Khan", "पिता का नाम", "अब्दुल करीम", "Abdul Kareem", "ई-07", "31", "पुरुष"],
  ["5", "504", "TST500004", "कमला देवी बैरवा", "Kamla Devi Bairwa", "पति का नाम", "बाबूलाल बैरवा", "Babulal Bairwa", "ई-19", "48", "महिला"],
  ["5", "505", "TST500005", "दीपक बैरवा", "Deepak Bairwa", "पिता का नाम", "बाबूलाल बैरवा", "Babulal Bairwa", "ई-19", "23", "पुरुष"]
];
