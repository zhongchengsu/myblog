# myblog
## Run
* git clone https://github.com/zhongchengsu/myblog.git
* cd myblog
* npm install
* npm start (before this step, do "Prepare DB")
* open browser http://127.0.0.1:3000

##Prepare DB
* install mongodb
* mkdir -p /home/$USER/.mongodb/data
* mkdir -p /home/$USER/.mongodb/log
* vim mongodb.conf
 * port=10001
 * dbpath= /home/$USER/.mongodb/data
 * logpath= /home/$USER/.mongodb/log/mongodb.log
 * logappend=true
* mongod -f /home/$USER/.mongodb/mongodb.conf &



