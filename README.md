## Overview:
Our team decided to impleemtn a smart acedemic portfolio management system. It allows an admin user to add students to the chain. 
They can then add more information about themselves, such as their grades and personal projects theyve worked on.
A lot of this information is actually stored in our off chain database as opposed to being on chain. This was done to so that our system was more scalable.
An employer can view a student's portfoloio by obtaining their public key. They cannot however biew teh students grades without adequate permissions.
One of the main concerns we had when developing our system was privacy, hence we implemented this feture of giving and removing permissions. An entity can only view the student's grades if the student has given them access to do so.

## Files: 
There are 2 smart contracts: the oracle comtract and the portfolio contract. The oracle contract is reponsible for communicating between onchain and off chain components, i.e the database and the contract.
We also have many src files. Thes files are all written is typescript, which was a new language for us to work with. We noticed that it was veing used in the tutorials and thought it would be the best to work with. it was also a good opportunity to work with something new.
The src files are responsible for deploying the sart contracts and also for getting data from the database.


## DB: 
For the database, we've used mongoDB. We chose this for a few reasons:
    - Firstly, one of our members, sarvesh, already had experience and felt confident in setting up a mongoDB database
    - Secondlt, there are many resources to help troubleshoot online if we were to rn into any issues
    - It is very ebginner friendly and the interface is easy to understand for new poeple. Thus the team did not have a hard time getting accustomed to it 
    - The API is quite extensive and theres many functions we can call to extract and update the database from our code
    - The database is free to use nad set up

## Deploying:
To deploy the contracts, first run `npx tsc` to ensure all the src files are compiled with the latest version. 
Next we can deploy the oracle with node `build/index.js deploy oracle`. As long is ganache is open, there shoudl be issues here
We then deploy the contract with ` node build/index.js deploy userapp oracle_addr` Note that oracle_addr should be replaced witht he address of the deployed oracle. 
We can call `build/index.js listen oracle oracle_addr` to listen for requests.
