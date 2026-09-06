import json
import sqlite3
import os
from app.database import get_db_connection, init_db
from app.engines.rag_engine import rag_engine

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data to ensure clean state
    tables = ["users", "competencies", "role_competency_targets", "reference_documents", "questions", "assessment_sessions", "item_responses", "igot_courses", "audit_logs"]
    for t in tables:
        cursor.execute(f"DELETE FROM {t}")

    # 1. Seed Users (4 Personas)
    users = [
        ("usr_learner_1", "MOSPI-JSO-2024-881", "Sarthak Solanke", "sarthak.jso@mospi.gov.in", "LEARNER", "Junior Statistical Officer", "MH", "DIV_WEST_MUMBAI", "en"),
        ("usr_coord_1", "MOSPI-COORD-104", "Rajesh Kumar", "rajesh.coord@mospi.gov.in", "COORDINATOR", "Training Coordinator", "DL", "DIV_HQ_TRAINING", "en"),
        ("usr_sme_1", "MOSPI-SME-042", "Dr. Ananya Sharma", "ananya.sme@mospi.gov.in", "SME_REVIEWER", "Senior Statistical Advisor", "DL", "DIV_CSO_METHODOLOGY", "en"),
        ("usr_admin_1", "MOSPI-HQ-001", "Dr. Amitabh Roy", "amitabh.dg@mospi.gov.in", "MOSPI_ADMIN", "Director General (MoSPI)", "DL", "DIV_HQ_DIRECTORATE", "en")
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", users)

    # 2. Seed Competencies
    competencies = [
        ("comp_sampling", "STAT_SAMPLING_01", "Sampling Theory & Multi-Stage Stratification", "Survey Methodology", "Probability sampling, multistage cluster design, NSSO sample allocation, sampling variance estimation, Second Stage Units (SSUs)."),
        ("comp_plfs", "STAT_PLFS_02", "PLFS Protocols & Activity Status Classification", "Field Operations", "Periodic Labour Force Survey classification, Usual Principal Status (UPS), Current Weekly Status (CWS), labour force participation rates."),
        ("comp_index", "STAT_INDEX_03", "Price Index Compilation (CPI / WPI / IIP)", "Macroeconomic Statistics", "Modified Laspeyres index formulation, base period weight updates, price imputation protocols, item basket aggregation."),
        ("comp_asi", "STAT_ASI_04", "Annual Survey of Industries & Industrial Classification", "Industrial Statistics", "ASI schedule inspection, National Industrial Classification (NIC-2008), gross value added (GVA) estimation for manufacturing units."),
        ("comp_natacc", "STAT_NATACC_05", "National Accounts & Gross State Domestic Product", "National Accounts", "System of National Accounts (SNA-2008), GSDP compilation, constant vs current price deflators, sectoral economic contributions.")
    ]
    cursor.executemany("INSERT INTO competencies VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", competencies)

    # 3. Seed Role Targets
    targets = [
        ("tgt_jso_1", "Junior Statistical Officer", "comp_sampling", 80),
        ("tgt_jso_2", "Junior Statistical Officer", "comp_plfs", 85),
        ("tgt_jso_3", "Junior Statistical Officer", "comp_index", 75),
        ("tgt_jso_4", "Junior Statistical Officer", "comp_asi", 70),
        ("tgt_jso_5", "Junior Statistical Officer", "comp_natacc", 65),

        ("tgt_sso_1", "Senior Statistical Officer", "comp_sampling", 90),
        ("tgt_sso_2", "Senior Statistical Officer", "comp_plfs", 90),
        ("tgt_sso_3", "Senior Statistical Officer", "comp_index", 85),
        ("tgt_sso_4", "Senior Statistical Officer", "comp_asi", 85),
        ("tgt_sso_5", "Senior Statistical Officer", "comp_natacc", 80),

        ("tgt_dir_1", "Director / Senior Statistician", "comp_sampling", 95),
        ("tgt_dir_2", "Director / Senior Statistician", "comp_plfs", 95),
        ("tgt_dir_3", "Director / Senior Statistician", "comp_index", 90),
        ("tgt_dir_4", "Director / Senior Statistician", "comp_asi", 90),
        ("tgt_dir_5", "Director / Senior Statistician", "comp_natacc", 95)
    ]
    cursor.executemany("INSERT INTO role_competency_targets VALUES (?, ?, ?, ?)", targets)

    # 4. Seed Reference Documents & Index Chunks
    doc1_content = """# NSS 78th Round Sample Design & Operational Guidelines Manual
## Section 1: Stratification and Sample Allocation
Page 14: In NSS sample surveys, a stratified multi-stage design is adopted. The first-stage units (FSUs) are census villages in the rural sector and Urban Frame Survey (UFS) blocks in the urban sector.
Page 15: The allocation of total sample FSUs among the states and union territories is done in proportion to their population as per Census 2011. Within each district, rural and urban sectors constitute separate basic strata.
Page 16: For allocating sample Second Stage Units (SSUs) among households, sample households are selected from each selected FSU through circular systematic sampling with equal probability.

## Section 2: Non-Sampling Error Controls
Page 22: Field supervisors must carry out 100% scrutiny of schedules filled by primary enumerators. Physical spot checks must be documented in the inspection register."""

    doc2_content = """# PLFS Survey Guidelines & Instructions to Field Staff (Schedule 10.4)
## Section 1: Activity Status Determination
Page 8: The activity status on which a person spent relatively long time during the 365 days preceding the date of survey is categorized as Usual Principal Activity Status (UPS).
Page 9: Under Current Weekly Status (CWS), a person is treated as employed if they pursued any economic activity for at least one hour on any one day during the 7 days reference period.
Page 12: In case of contradictory responses regarding unpaid family labour, priority rules must be applied systematically."""

    doc3_content = """# MoSPI Price Statistics Division: CPI Compilation Handbook
## Section 1: Index Formulation and Basket Weighting
Page 5: Consumer Price Index (CPI) numbers for Rural, Urban and Combined are compiled using the Modified Laspeyres Price Index formula with fixed base weights derived from Consumer Expenditure Surveys.
Page 11: When prices of specific items are temporarily unavailable, geometric mean imputation based on adjacent market quotes in the same sub-stratum must be executed."""

    docs = [
        ("doc_nss_78", "NSS 78th Round Sample Design & Operational Manual", "NSS_MANUAL", "/mospi/docs/nss_78th_round.pdf", "usr_coord_1", "INGESTED", 8, doc1_content),
        ("doc_plfs_guidelines", "PLFS Schedule 10.4 Field Enumerator Guidelines", "PLFS_GUIDELINE", "/mospi/docs/plfs_instructions.pdf", "usr_coord_1", "INGESTED", 6, doc2_content),
        ("doc_cpi_handbook", "MoSPI CPI Price Compilation Handbook (Base 2012)", "PRICE_MANUAL", "/mospi/docs/cpi_handbook.pdf", "usr_coord_1", "INGESTED", 5, doc3_content)
    ]
    cursor.executemany("INSERT INTO reference_documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", docs)

    # Index in RAG Engine
    rag_engine.chunk_document("doc_nss_78", "NSS 78th Round Sample Design & Operational Manual", doc1_content)
    rag_engine.chunk_document("doc_plfs_guidelines", "PLFS Schedule 10.4 Field Enumerator Guidelines", doc2_content)
    rag_engine.chunk_document("doc_cpi_handbook", "MoSPI CPI Price Compilation Handbook (Base 2012)", doc3_content)

    # 5. Seed Questions Bank (Pre-calibrated 2PL IRT items)
    questions = [
        # Sampling items
        (
            "q_samp_01", "doc_nss_78", "comp_sampling", "MCQ", "EASY", -0.8, 1.2,
            "In NSS multi-stage sampling design, what constitutes the First Stage Unit (FSU) in the rural sector?",
            "NSS बहु-चरणीय नमूना डिजाइन में, ग्रामीण क्षेत्र में प्रथम चरण इकाई (FSU) क्या है?",
            json.dumps([
                {"id": 0, "text": "Census Village", "text_hi": "जनगणना गाँव"},
                {"id": 1, "text": "Urban Frame Survey Block", "text_hi": "शहरी फ्रेम सर्वेक्षण ब्लॉक"},
                {"id": 2, "text": "Individual Agricultural Household", "text_hi": "व्यक्तिगत कृषि परिवार"},
                {"id": 3, "text": "District Collectorate Division", "text_hi": "जिला कलेक्ट्रेट प्रभाग"}
            ]),
            0,
            "As defined in NSS 78th Round Manual Section 1, census villages serve as FSUs in rural areas while UFS blocks serve as FSUs in urban areas.",
            "NSS 78वें दौर के मैनुअल खंड 1 के अनुसार, ग्रामीण क्षेत्रों में जनगणना गाँव FSU के रूप में और शहरी क्षेत्रों में UFS ब्लॉक FSU के रूप में कार्य करते हैं।",
            "The first-stage units (FSUs) are census villages in the rural sector and Urban Frame Survey (UFS) blocks in the urban sector.",
            14, 0.94, "APPROVED", "usr_sme_1", "2026-09-01 10:00:00"
        ),
        (
            "q_samp_02", "doc_nss_78", "comp_sampling", "MCQ", "MEDIUM", 0.4, 1.5,
            "When allocating sample Second Stage Units (SSUs) among selected FSUs, what sampling mechanism is mandated by MoSPI guidelines?",
            "चयनित FSU के बीच द्वितीय चरण इकाइयों (SSU) को आवंटित करते समय, MoSPI दिशानिर्देशों द्वारा किस सैंपलिंग तंत्र का आदेश दिया गया है?",
            json.dumps([
                {"id": 0, "text": "Circular systematic sampling with equal probability", "text_hi": "समान संभावना के साथ परिपत्र व्यवस्थित सैंपलिंग"},
                {"id": 1, "text": "Simple random sampling with replacement (SRSWR)", "text_hi": "प्रतिस्थापन के साथ सरल यादृच्छिक सैंपलिंग"},
                {"id": 2, "text": "Convenience quota sampling based on road accessibility", "text_hi": "सड़क पहुंच के आधार पर सुविधा कोटा सैंपलिंग"},
                {"id": 3, "text": "Snowball referral sampling", "text_hi": "स्नोबॉल रेफरल सैंपलिंग"}
            ]),
            0,
            "MoSPI sampling protocols mandate circular systematic sampling with equal probability to ensure unbiased household selection within FSUs.",
            "MoSPI सैंपलिंग प्रोटोकॉल FSU के भीतर निष्पक्ष घरेलू चयन सुनिश्चित करने के लिए समान संभावना के साथ परिपत्र व्यवस्थित सैंपलिंग का आदेश देते हैं।",
            "Sample households are selected from each selected FSU through circular systematic sampling with equal probability.",
            16, 0.91, "APPROVED", "usr_sme_1", "2026-09-01 10:05:00"
        ),
        (
            "q_samp_03", "doc_nss_78", "comp_sampling", "MCQ", "HARD", 1.4, 1.8,
            "In Neyman optimum allocation for a stratified sample survey, sample size in each stratum is directly proportional to:",
            "स्तरीकृत नमूना सर्वेक्षण के लिए नेमैन इष्टतम आवंटन में, प्रत्येक स्तर में नमूना आकार सीधे किसके आनुपातिक होता है?",
            json.dumps([
                {"id": 0, "text": "Product of stratum size (N_h) and stratum standard deviation (S_h)", "text_hi": "स्तर आकार (N_h) और स्तर मानक विचलन (S_h) का गुणनफल"},
                {"id": 1, "text": "Square root of the total national sample size alone", "text_hi": "केवल कुल राष्ट्रीय नमूना आकार का वर्गमूल"},
                {"id": 2, "text": "Inverse of the stratum sampling variance", "text_hi": "स्तर सैंपलिंग भिन्नता का व्युत्क्रम"},
                {"id": 3, "text": "Number of field investigators deployed in the district", "text_hi": "जिले में तैनात फील्ड जांचकर्ताओं की संख्या"}
            ]),
            0,
            "Neyman allocation formula allocates n_h = n * (N_h * S_h) / sum(N_i * S_i), minimizing the variance of the estimated mean for a fixed sample size.",
            "नेमैन आवंटन सूत्र n_h = n * (N_h * S_h) / sum(N_i * S_i) आवंटित करता है, जो निश्चित नमूना आकार के लिए अनुमानित माध्य के विचरण को न्यूनतम करता है।",
            "Allocation follows Neyman optimum allocation where sample size is proportional to N_h * S_h.",
            15, 0.88, "APPROVED", "usr_sme_1", "2026-09-01 10:10:00"
        ),

        # PLFS items
        (
            "q_plfs_01", "doc_plfs_guidelines", "comp_plfs", "MCQ", "EASY", -0.6, 1.3,
            "Under PLFS survey methodology, what is the reference period for determining the Usual Principal Activity Status (UPS)?",
            "PLFS सर्वेक्षण पद्धति के तहत, सामान्य प्रमुख गतिविधि स्थिति (UPS) निर्धारित करने के लिए संदर्भ अवधि क्या है?",
            json.dumps([
                {"id": 0, "text": "365 days preceding the date of survey", "text_hi": "सर्वेक्षण की तिथि से पूर्व के 365 दिन"},
                {"id": 1, "text": "7 days preceding the date of survey", "text_hi": "सर्वेक्षण की तिथि से पूर्व के 7 दिन"},
                {"id": 2, "text": "30 days preceding the date of survey", "text_hi": "सर्वेक्षण की तिथि से पूर्व के 30 दिन"},
                {"id": 3, "text": "Previous financial year only", "text_hi": "केवल पिछला वित्तीय वर्ष"}
            ]),
            0,
            "Usual Principal Status reflects the activity on which an individual spent the majority of time during the 365-day reference window.",
            "सामान्य प्रमुख स्थिति उस गतिविधि को दर्शाती है जिस पर किसी व्यक्ति ने 365 दिनों की संदर्भ अवधि के दौरान अधिकांश समय बिताया।",
            "The activity status on which a person spent relatively long time during the 365 days preceding the date of survey is categorized as Usual Principal Activity Status.",
            8, 0.95, "APPROVED", "usr_sme_1", "2026-09-01 10:15:00"
        ),
        (
            "q_plfs_02", "doc_plfs_guidelines", "comp_plfs", "MCQ", "MEDIUM", 0.2, 1.6,
            "According to PLFS Current Weekly Status (CWS) criteria, what minimum threshold of economic activity qualifies a person as employed?",
            "PLFS वर्तमान साप्ताहिक स्थिति (CWS) मानदंडों के अनुसार, आर्थिक गतिविधि की कौन सी न्यूनतम सीमा किसी व्यक्ति को नियोजित के रूप में योग्य बनाती है?",
            json.dumps([
                {"id": 0, "text": "At least 1 hour on any one day during the 7-day reference week", "text_hi": "7-दिवसीय संदर्भ सप्ताह के दौरान किसी भी एक दिन कम से कम 1 घंटा"},
                {"id": 1, "text": "At least 4 hours daily for at least 4 days in the week", "text_hi": "सप्ताह में कम से कम 4 दिनों के लिए प्रतिदिन कम से कम 4 घंटे"},
                {"id": 2, "text": "Full 40 hours of paid institutional employment", "text_hi": "सशुल्क संस्थागत रोजगार के पूरे 40 घंटे"},
                {"id": 3, "text": "Receipt of formal wages exceeding the statutory minimum wage", "text_hi": "वैधानिक न्यूनतम वेतन से अधिक औपचारिक मजदूरी की प्राप्ति"}
            ]),
            0,
            "CWS defines employment using a 1-hour threshold on any single day in the reference week per international ILO and MoSPI standards.",
            "CWS अंतरराष्ट्रीय ILO और MoSPI मानकों के अनुसार संदर्भ सप्ताह में किसी भी एक दिन 1 घंटे की सीमा का उपयोग करके रोजगार को परिभाषित करता है।",
            "Under Current Weekly Status (CWS), a person is treated as employed if they pursued any economic activity for at least one hour on any one day during the 7 days reference period.",
            9, 0.92, "APPROVED", "usr_sme_1", "2026-09-01 10:20:00"
        ),

        # Price Index items
        (
            "q_idx_01", "doc_cpi_handbook", "comp_index", "MCQ", "EASY", -0.7, 1.2,
            "Which statistical formula is used by MoSPI as the mathematical foundation for compiling India's Consumer Price Index (CPI)?",
            "भारत के उपभोक्ता मूल्य सूचकांक (CPI) के संकलन के लिए गणितीय आधार के रूप में MoSPI द्वारा किस सांख्यिकीय सूत्र का उपयोग किया जाता है?",
            json.dumps([
                {"id": 0, "text": "Modified Laspeyres Price Index Formula", "text_hi": "संशोधित लास्पायरेस मूल्य सूचकांक सूत्र"},
                {"id": 1, "text": "Paasche Current Quantity Formula", "text_hi": "पाशे चालू मात्रा सूत्र"},
                {"id": 2, "text": "Simple Geometric Mean Index", "text_hi": "सरल ज्यामितीय माध्य सूचकांक"},
                {"id": 3, "text": "Marshall-Edgeworth Compromise Index", "text_hi": "मार्शल-एजवर्थ समझौता सूचकांक"}
            ]),
            0,
            "MoSPI calculates CPI using the Modified Laspeyres formula using fixed base-year expenditure weights.",
            "MoSPI निश्चित आधार-वर्ष व्यय भार का उपयोग करके संशोधित लास्पायरेस सूत्र का उपयोग करके CPI की गणना करता है।",
            "Consumer Price Index (CPI) numbers for Rural, Urban and Combined are compiled using the Modified Laspeyres Price Index formula with fixed base weights.",
            5, 0.96, "APPROVED", "usr_sme_1", "2026-09-01 10:25:00"
        ),
        (
            "q_idx_02", "doc_cpi_handbook", "comp_index", "MCQ", "HARD", 1.1, 1.7,
            "When an item's price is temporarily missing in an urban price collection center, what is the MoSPI standard price imputation method?",
            "जब किसी शहरी मूल्य संग्रह केंद्र में किसी वस्तु की कीमत अस्थायी रूप से अनुपलब्ध होती है, तो MoSPI मानक मूल्य आरोपण विधि क्या है?",
            json.dumps([
                {"id": 0, "text": "Geometric mean price relative imputation of available quotes in the same sub-stratum", "text_hi": "उसी उप-स्तर में उपलब्ध उद्धरणों का ज्यामितीय माध्य मूल्य सापेक्ष आरोपण"},
                {"id": 1, "text": "Carry forward the previous year's raw price without adjustment", "text_hi": "समायोजन के बिना पिछले वर्ष के कच्चे मूल्य को आगे बढ़ाना"},
                {"id": 2, "text": "Assign zero value to the price quotation", "text_hi": "मूल्य उद्धरण को शून्य मान निर्दिष्ट करना"},
                {"id": 3, "text": "Replace with the national average headline inflation rate", "text_hi": "राष्ट्रीय औसत शीर्षक मुद्रास्फीति दर से प्रतिस्थापित करना"}
            ]),
            0,
            "CPI Handbook mandates geometric mean relative price movement imputation from reporting outlets in the same sub-stratum.",
            "CPI हैंडबुक उसी उप-स्तर में रिपोर्टिंग आउटलेट से ज्यामितीय माध्य सापेक्ष मूल्य आंदोलन आरोपण को अनिवार्य करता है।",
            "When prices of specific items are temporarily unavailable, geometric mean imputation based on adjacent market quotes in the same sub-stratum must be executed.",
            11, 0.89, "APPROVED", "usr_sme_1", "2026-09-01 10:30:00"
        ),

        # ASI & Industrial items
        (
            "q_asi_01", "doc_nss_78", "comp_asi", "MCQ", "MEDIUM", 0.3, 1.4,
            "In the Annual Survey of Industries (ASI), what industrial classification code standard is utilized for categorizing manufacturing establishments?",
            "उद्योगों के वार्षिक सर्वेक्षण (ASI) में, विनिर्माण प्रतिष्ठानों को वर्गीकृत करने के लिए किस औद्योगिक वर्गीकरण कोड मानक का उपयोग किया जाता है?",
            json.dumps([
                {"id": 0, "text": "National Industrial Classification (NIC-2008)", "text_hi": "राष्ट्रीय औद्योगिक वर्गीकरण (NIC-2008)"},
                {"id": 1, "text": "Standard International Trade Classification (SITC Rev 4)", "text_hi": "मानक अंतर्राष्ट्रीय व्यापार वर्गीकरण (SITC Rev 4)"},
                {"id": 2, "text": "Harmonized System of Nomenclature (HSN Code)", "text_hi": "सामंजस्यपूर्ण नामकरण प्रणाली (HSN कोड)"},
                {"id": 3, "text": "ISIC Rev 2 Legacy Standard", "text_hi": "ISIC Rev 2 लीगेसी मानक"}
            ]),
            0,
            "ASI uses NIC-2008 4-digit and 5-digit codes for granular manufacturing activity classification in India.",
            "ASI भारत में दानेदार विनिर्माण गतिविधि वर्गीकरण के लिए NIC-2008 4-अंकीय और 5-अंकीय कोड का उपयोग करता है।",
            "Industrial establishments are categorized per National Industrial Classification (NIC-2008).",
            7, 0.93, "APPROVED", "usr_sme_1", "2026-09-01 10:35:00"
        ),

        # National Accounts items
        (
            "q_nat_01", "doc_nss_78", "comp_natacc", "MCQ", "MEDIUM", 0.5, 1.5,
            "Under the System of National Accounts (SNA-2008), how is Gross Value Added (GVA) at Basic Prices derived from GVA at Factor Cost?",
            "राष्ट्रीय लेखा प्रणाली (SNA-2008) के तहत, कारक लागत पर GVA से मूल कीमतों पर सकल मूल्य वर्धित (GVA) कैसे प्राप्त किया जाता है?",
            json.dumps([
                {"id": 0, "text": "GVA at Factor Cost + (Production Taxes - Production Subsidies)", "text_hi": "कारक लागत पर GVA + (उत्पादन कर - उत्पादन सब्सिडी)"},
                {"id": 1, "text": "GVA at Factor Cost - Total Product Taxes", "text_hi": "कारक लागत पर GVA - कुल उत्पाद कर"},
                {"id": 2, "text": "GDP at Market Prices + Import Tariffs", "text_hi": "बाजार मूल्य पर GDP + आयात शुल्क"},
                {"id": 3, "text": "Net National Product divided by Population", "text_hi": "जनसंख्या द्वारा विभाजित शुद्ध राष्ट्रीय उत्पाद"}
            ]),
            0,
            "In SNA-2008 methodology, GVA at Basic Prices = GVA at Factor Cost + (Production Taxes - Production Subsidies).",
            "SNA-2008 पद्धति में, मूल कीमतों पर GVA = कारक लागत पर GVA + (उत्पादन कर - उत्पादन सब्सिडी)।",
            "GVA at Basic Prices equals GVA at Factor Cost plus net production taxes.",
            19, 0.90, "APPROVED", "usr_sme_1", "2026-09-01 10:40:00"
        ),

        # AI-Generated Items in SME Review Queue (PENDING_REVIEW)
        (
            "q_sme_pending_01", "doc_nss_78", "comp_sampling", "MCQ", "HARD", 1.3, 1.6,
            "In multi-stage survey scrutiny, if an enumerator records a non-sampling error rate exceeding 15% in SSU identification, what mandatory field protocol must the supervisor trigger?",
            "बहु-चरणीय सर्वेक्षण जांच में, यदि कोई गणनाकर्ता SSU पहचान में 15% से अधिक गैर-नमूनाकरण त्रुटि दर दर्ज करता है, तो पर्यवेक्षक को कौन सा अनिवार्य फील्ड प्रोटोकॉल ट्रिगर करना होगा?",
            json.dumps([
                {"id": 0, "text": "Complete re-canvassing of the FSU with mandatory joint re-survey", "text_hi": "अनिवार्य संयुक्त पुन: सर्वेक्षण के साथ FSU का पूर्ण पुन: सर्वेक्षण"},
                {"id": 1, "text": "Statistical imputation without visiting the field", "text_hi": "क्षेत्र का दौरा किए बिना सांख्यिकीय आरोपण"},
                {"id": 2, "text": "Discarding the entire district sample data", "text_hi": "पूरे जिले के नमूना डेटा को छोड़ना"},
                {"id": 3, "text": "Manual adjustment of population weights", "text_hi": "जनसंख्या भार का मैन्युअल समायोजन"}
            ]),
            0,
            "MoSPI inspection protocol mandates 100% field re-canvassing and joint inspection when serious non-sampling discrepancies occur.",
            "MoSPI निरीक्षण प्रोटोकॉल गंभीर गैर-नमूनाकरण विसंगतियां होने पर 100% फील्ड पुन: सर्वेक्षण और संयुक्त निरीक्षण को अनिवार्य करता है।",
            "Field supervisors must carry out 100% scrutiny of schedules filled by primary enumerators. Physical spot checks must be documented in the inspection register.",
            22, 0.82, "PENDING_REVIEW", None, None
        ),
        (
            "q_sme_pending_02", "doc_cpi_handbook", "comp_index", "MCQ", "MEDIUM", 0.6, 1.4,
            "When conducting quality adjustment in price indices for product substitutions, which approach does MoSPI recommend to preserve price index continuity?",
            "उत्पाद प्रतिस्थापन के लिए मूल्य सूचकांकों में गुणवत्ता समायोजन करते समय, MoSPI मूल्य सूचकांक निरंतरता बनाए रखने के लिए किस दृष्टिकोण की सिफारिश करता है?",
            json.dumps([
                {"id": 0, "text": "Overlap price linking method based on dual pricing period observations", "text_hi": "दोहरी मूल्य निर्धारण अवधि के अवलोकनों के आधार पर ओवरलैप मूल्य लिंकिंग विधि"},
                {"id": 1, "text": "Assuming new product has zero price change from base period", "text_hi": "यह मानना कि नए उत्पाद में आधार अवधि से शून्य मूल्य परिवर्तन हुआ है"},
                {"id": 2, "text": "Dropping the product permanently from the index basket", "text_hi": "उत्पाद को सूचकांक बास्केट से स्थायी रूप से हटाना"},
                {"id": 3, "text": "Direct substitution ignoring specification changes", "text_hi": "विनिर्देश परिवर्तनों की अनदेखी करते हुए प्रत्यक्ष प्रतिस्थापन"}
            ]),
            0,
            "Overlap pricing allows chaining the old and new product series smoothly across successive survey months.",
            "ओवरलैप मूल्य निर्धारण क्रमिक सर्वेक्षण महीनों में पुरानी और नई उत्पाद श्रृंखला को सुचारू रूप से जोड़ने की अनुमति देता है।",
            "Geometric mean imputation and overlap pricing must be executed to maintain price continuity.",
            11, 0.79, "PENDING_REVIEW", None, None
        )
    ]

    cursor.executemany("""
    INSERT INTO questions (
        id, document_id, competency_id, question_type, difficulty_level,
        irt_b_difficulty, irt_a_discrimination, stem, stem_hi, options,
        correct_option_index, explanation, explanation_hi, citation_text,
        citation_page, confidence_score, review_status, reviewed_by, reviewed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, questions)

    # 6. Seed iGOT Karmayogi Courses
    igot_courses = [
        (
            "igot_crs_01", "IGOT-STAT-201", "Advanced Survey Sampling & NSS Design",
            "उन्नत सर्वेक्षण सैंपलिंग और NSS डिजाइन",
            "iGOT Karmayogi / MoSPI Academy", 180, "comp_sampling", "Advanced",
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            "https://igotkarmayogi.gov.in/course/stat-sampling-201", 1, 0, 4.9
        ),
        (
            "igot_crs_02", "IGOT-PLFS-102", "Field Survey Protocols & PLFS Classification",
            "फील्ड सर्वेक्षण प्रोटोकॉल और PLFS वर्गीकरण",
            "National Statistical Systems Training Academy (NSSTA)", 120, "comp_plfs", "Intermediate",
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            "https://igotkarmayogi.gov.in/course/plfs-field-102", 1, 0, 4.8
        ),
        (
            "igot_crs_03", "IGOT-INDEX-301", "Price Index Numbers: CPI & WPI Compilation",
            "मूल्य सूचकांक संख्या: CPI और WPI संकलन",
            "MoSPI Price Statistics Wing", 150, "comp_index", "Advanced",
            "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80",
            "https://igotkarmayogi.gov.in/course/cpi-wpi-301", 0, 0, 4.7
        ),
        (
            "igot_crs_04", "IGOT-ASI-105", "Industrial Statistics & ASI Scrutiny Masterclass",
            "औद्योगिक सांख्यिकी और ASI जांच मास्टरक्लास",
            "NSSTA Greater Noida", 90, "comp_asi", "Intermediate",
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
            "https://igotkarmayogi.gov.in/course/asi-scrutiny-105", 0, 0, 4.8
        ),
        (
            "igot_crs_05", "IGOT-SNA-401", "System of National Accounts (SNA 2008) & GSDP",
            "राष्ट्रीय लेखा प्रणाली (SNA 2008) और GSDP",
            "Central Statistics Office (CSO)", 240, "comp_natacc", "Advanced",
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
            "https://igotkarmayogi.gov.in/course/sna-gsdp-401", 0, 0, 4.9
        )
    ]
    cursor.executemany("INSERT INTO igot_courses VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", igot_courses)

    # 7. Seed Sample Assessment Session for Demo
    sample_scores = json.dumps({"STAT_SAMPLING_01": 66, "STAT_PLFS_02": 72, "STAT_INDEX_03": 58, "STAT_ASI_04": 61, "STAT_NATACC_05": 49})
    sample_thetas = json.dumps({"STAT_SAMPLING_01": 0.45, "STAT_PLFS_02": 0.62, "STAT_INDEX_03": 0.21, "STAT_ASI_04": 0.32, "STAT_NATACC_05": -0.05})
    cursor.execute("""
    INSERT INTO assessment_sessions (id, user_id, session_type, status, theta_estimates, final_scores, items_administered, started_at, completed_at)
    VALUES ('sess_demo_completed', 'usr_learner_1', 'DIAGNOSTIC', 'COMPLETED', ?, ?, 6, '2026-09-02 14:00:00', '2026-09-02 14:14:32')
    """, (sample_thetas, sample_scores))

    # 8. Seed Audit Log entries
    cursor.execute("""
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES ('log_1', 'usr_sme_1', 'APPROVE_QUESTION', 'QUESTION', 'q_samp_01', 'Approved NSS sampling question with verified citation')
    """)

    conn.commit()
    conn.close()
    print("Database successfully seeded with MoSPI official taxonomy, 4 personas, documents, calibrated IRT items, and iGOT courses!")

if __name__ == "__main__":
    seed_database()
