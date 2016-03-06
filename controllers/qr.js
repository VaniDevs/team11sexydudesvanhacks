exports.getQRScan = function(req, res) {
  res.render('account/qrScan', {
    title: 'qrScan',
  });
};

exports.getQRForm = function(req, res) {
  var pictureURL;
  if (req.user) {
    pictureURL = req.user.profile.picture;
  } else {
    pictureURL = '';
  }
  var pictureURL =
  res.render('qrForm', {
    title: 'qrForm',
    userPicture: pictureURL
  });
};

exports.getQRCode = function(req, res) {
  var Candidate = req.body;
  Candidate.linkedin = (req.body.linkedin).length === 19 ? '' : req.body.linkedin;

  res.render('qrCode', {
    title: 'Your QR Code',
    qrCodeUrl: 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl='+JSON.stringify(req.body)
  });
};
