module.exports = {
  upload (req, res) {
    console.log(req.file)
    res.json({
      file: req.file
    })
  }
}
