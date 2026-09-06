const { assessRisk } = require('../utils/riskEngine');

// @desc    Live rule-based risk assessment (Decision support only - Not AI diagnosis)
// @route   POST /api/risk/assess
// @access  Private
exports.assessPatientRisk = async (req, res, next) => {
  try {
    const { symptoms, vitals } = req.body;
    const result = assessRisk({ symptoms, vitals });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
