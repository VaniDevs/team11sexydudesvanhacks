#Just Choose Me

## Inspiration
What is the point of career fairs if recruiters tell potential candidates to just apply online, often with no response back? Recruiters are sick of the old-fashioned system of paper-copy resumes, in which they must manually scan each application, and individually enter data into their recruitment database (not to mention those long portfolio URLs!). Online application lack the personal interaction with passionate candidates that cannot be encapsulated on a piece of paper. The goal of the project was to simplify and speed up the process between meeting a potential intern/employee and getting that first interview offer to them.
## What it does
Candidates are able to enter information about themselves, such as a picture, resume URLs, LinkedIn URLs, and their top three projects. From there, the information is bundled into a QR Code which recruiters can quickly and easily scan. Recruiters can also add additional comments such as "This student is looking for a Fall 2016 internship" to each scanned candidate. Recruiters can then review all the Candidates scanned and view them in a list.
## How we built it
The APIs for saving candidate information, authentication, authorization, are all built using Node.js. The front end of the WebApp portion of the stack was done using html5, jQuery, jade, and css. The Android app uses the REST APIs from the Nodejs web server.
## Challenges we ran into
- Finding points of integration between the Android app and the Webstack
- Dependencies from the Android app on the REST APIs
## Accomplishments that we're proud of
- Implementation of QR code scanning and recognition on both Android and Webapp
- POST and GET calls successful from Android and Webapp
- LinkedIn integration on Android
- Teamwork
## What we learned
- The current recruitment process is inefficient and discouraging for both recruiters and candidates
- This is the first time many of us has used frameworks such as Node.js and jade
- Integrating a webApp with an Android app to create a multi-purpose platform 
- QR Codes are awesome!
## What's next for Just Choose Me
Future iterations would include:
1.    Candidate List Search, Sort, and Download functionalities - A recruiter should be able to search his/her candidates that they have scanned, sort by a particular parameter (eg. Date), and download the candidate list in his/her preferred format to continue the recruitment process (eg. Download candidate information as JSON file to be inputted to their applicant tracking system) 
2.     Organization Account – A company should be able to create a Just Choose Me account, including a company profile in which multiple recruiters can be a part of. Recruiters under the same organization will be able to view all candidates that have connected to a recruiter under that organization. Organizations may choose to post announcements or new job postings, in which potential candidates can subscribe to.
3.    Interest tags – Tags/keywords candidates can add to his/her profile to personalize what jobs you are looking for, and what they are interested in. Recruiters can use tag searching features to search for candidates.
