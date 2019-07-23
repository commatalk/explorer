<h1>Setup:<h1>
	<p>sudo apt update<p>
	<p>sudo apt upgrade<p>
	<p>sudo apt install npm build-essential libzmq3-dev<p>
	<p>cd ~<p>
	<p>wget https://github.com/dashpay/dash/releases/download/v0.13.3.0/dashcore-0.13.3.0-x86_64-linux-gnu.tar.gz<p>
	<p>tar -xvzf dashcore-0.13.3.0-x86_64-linux-gnu.tar.gz<p>
	<p>rm dashcore-0.13.3.0-x86_64-linux-gnu.tar.gz<p>
	<p>sudo npm install -g @dashevo/dashcore-node<p>
	<p>cd /usr/local/lib/node_modules/@dashevo/dashcore-node/lib/services/<p>
	<p>nano dashd.js<p>
	<p>     ##change rpcport in Dash.prototype._getDefaultConf = function() to rpcport: 51473<p>
    <p>     ##change networkOptions.rpcport in Dash.prototype._getDefaultConf to networkOptions.rpcport = 151473<p>
	<p>cd yourdir<p>
	<p>nano dashcore-node.json<p>
		<p>     ##Change the value of **datadir** to<p> 
		<p>     ##Change the value of **exec** to dir which save data<p>
		<p>     ##Optionally change the value of network to testnet if you want to run Insight on testnet<p>
<h1>Start:<h1>
	<p>-dashcore-node start<p>
	<p>-http://<ip-address>:3001/insight/<p>

