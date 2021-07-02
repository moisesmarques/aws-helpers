const { SSM, SecretsManager } = require("aws-sdk");

async function getParameterWorker (name, decrypt) {
    const ssm = new SSM();
    const result = await ssm
    .getParameter({ Name: name, WithDecryption: decrypt })
    .promise();
    return result.Parameter.Value;
}

exports.getParameter = async function getParameter (name) {
    return getParameterWorker(name, false);
}

exports.getEncryptedParameter = async function getEncryptedParameter (name) {
    return getParameterWorker(name, true);
}

exports.getSecretValue = async (secretName, region) => {
    
    return new Promise((resolve, reject) => {
        
        var client = new SecretsManager({
            region: region
        });
        
        return client.getSecretValue({ SecretId: secretName }, function(err, data) {
            if (err) {
                reject(err)
            }
            else {
                // Decrypts secret using the associated KMS CMK.
                // Depending on whether the secret is a string or binary, one of these fields will be populated.
                if ('SecretString' in data) {
                    resolve(data.SecretString)
                } else {
                    let buff = new Buffer(data.SecretBinary, 'base64');
                    resolve(buff.toString('ascii'))
                }
            }
        })
        
    });
    
}