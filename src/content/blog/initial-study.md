---
title: "Initial Test: Reware AI in Hunting Vulnerabilities"
description: "An in-depth look at our first test of Reware AI using a custom vulnerable Flask app, revealing how it stacks up against CodeQL in detecting 24 diverse security flaws."
pubDate: 2025-06-06T00:00:00Z
thumbnail: "/blog-images/ai-security.jpg"
author: "Reza Hazhirpasand"
tags: ["AI"]
---

This post details our very first exploratory test of **Reware AI**, offering a transparent look at what we found and how our tool performed against some common vulnerabilities in a controlled environment. We also include a comparison with **CodeQL**, GitHub's powerful semantic code analysis engine, to provide context on current leading tools. Join us as we share the early insights that are shaping the future of Reware AI.

For this initial test, we utilized a custom-built, intentionally vulnerable Flask application. This application was carefully crafted to contain a diverse set of **24 vulnerabilities**, encompassing both traditional coding flaws (like Injections and upload issues), subtle logical issues that often evade conventional security analysis tools.

Let's look at a specific, simple code example from this application to understand one of the vulnerabilities:

```python
# account.py
from flask import Blueprint, render_template, request, redirect, session

bp = Blueprint('account', __name__, url_prefix='/account')

users = {'admin': 'admin123'} # Hardcoded credentials

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username] == password:
            session['user'] = username
            return redirect('/dashboard/home')
    return render_template('login.html')

```

In the `account.py` file, within the `login` function, the `users` dictionary contains hardcoded administrative credentials (`'admin': 'admin123'`). This is a critical security flaw. Hardcoding sensitive information like passwords directly into the source code means that anyone with access to the codebase can instantly compromise the system. It bypasses proper credential management practices (like using environment variables, configuration files, or secure vaults) and makes the application highly vulnerable to unauthorized access if the code is ever exposed, even accidentally.


Here's a summary of our findings, comparing CodeQL's detection capabilities with Reware AI's against a set of known vulnerabilities:

| Vuln                                        | Endpoint                          | File                             | CodeQL | Reware |
| :------------------------------------------ | :-------------------------------- | :------------------------------- | :----- | :----- |
| SQL Injection                               | view_profile OR get_user_data     | `app/routes/profile.py`          | ✅     | ✅     |
| Stored XSS                                  | submit_feedback OR thank_you      | `app/routes/feedback.py`         | ❌     | ✅     |
| Log injection                               | submit_feedback()                 | `app/routes/feedback.py`         | ❌     | ✅     |
| Stored XSS                                  | home                              | `app/routes/dashboard.py`        | ❌     | ❌     |
| Stored XSS                                  | lookup_user                       | `app/routes/dashboard.py`        | ❌     | ✅     |
| Session Fixation                            | lookup_user                       | `app/routes/dashboard.py`        | ❌     | ✅     |
| Injection in Cookie                         | login                             | `app/routes/account_admin.py`    | ✅     | ❌     |
| Cleartext in Cookie / Sensitive Data exposure | login                             | `app/routes/account_admin.py`    | ✅     | ✅     |
| Insecure Cookie (secure httponly)           | login                             | `app/routes/account_admin.py`    | ✅     | ✅     |
| Hardcoded Secrets                           | account_admin global              | `app/routes/account_admin.py`    | ❌     | ❌     |
| Hardcoded Secrets                           | Login()                           | `app/routes/account.py`          | ❌     | ✅     |
| Insecure File Upload - dangerous extension  | upload                            | `app/routes/media.py`            | ❌     | ✅     |
| Insecure File Upload - file overwrite       | upload                            | `app/routes/media.py`            | ❌     | ❌     |
| Insecure File Upload - Size DoS             | upload                            | `app/routes/media.py`            | ❌     | ❌     |
| File Upload Size Bomb DoS                   | upload_report                     | `app/routes/reports.py`          | ❌     | ❌     |
| File content type                           | upload_report                     | `app/routes/reports.py`          | ❌     | ❌     |
| File name overwrite vuln                    | upload_report                     | `app/routes/reports.py`          | ❌     | ✅     |
| Blind SQL Injection                         | check_user                        | `app/routes/verify.py`           | ✅     | ✅     |
| SQL Injection                               | items OR build_query              | `app/routes/search.py`           | ✅     | ✅     |
| Reflected XSS (Subtle)                      | update                            | `app/routes/settings.py`         | ✅     | ✅     |
| SSTI                                        | update                            | `app/routes/settings.py`         | ✅     | ❌     |
| debug mode                                  | run                               | `app/run.py`                     | ✅     | ✅     |
| CSRF                                        | Global                            | `config.py`                      | ❌     | ✅     |
| **Total Detections** |                                   |                                  | **9** | **16** |

Despite a promising initial performance, Reware AI did identify **2 false positives** in these preliminary results. The primary challenges we are currently focusing on include efficiently parsing mid to large codebases, ensuring the generation of precise contextual understanding for analysis under diverse conditions, optimizing the speed of the initial scan for very large file numbers, and refining our model's ability to differentiate true positives from false positives when encountering extremely complex or unusually written code. These are crucial areas of ongoing development as we strive for more accuracy and scalability.
