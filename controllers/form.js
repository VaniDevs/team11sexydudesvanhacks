exports.getStudybuddyForm = function(req, res) {
    res.render('forms/studybuddyform', {
      title: 'Apply to be a Study Buddy'
    });
}

exports.getBigSisterForm = function(req, res) {
    res.render('forms/bigsisterform', {
      title: 'Apply to be a Big Sister'
    });
}

exports.getGoGirlForm = function(req, res) {
    res.render('forms/gogirlform', {
      title: 'Apply to be a Go Girl'
    });
}
