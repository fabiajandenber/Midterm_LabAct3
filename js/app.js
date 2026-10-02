// Laboratory Activity #3 - Student Registration Form with Input Validation

// ---------- Pure validation functions (no DOM access) ----------
var STUDENT_NUMBER_PATTERN = /^\d{2}-\d{4}-\d{3}$/;
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var MOBILE_PATTERN = /^(09\d{9}|\+639\d{9})$/;
var PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/;

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return STUDENT_NUMBER_PATTERN.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return PASSWORD_PATTERN.test(value);
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

function isValidMobile(value) {
  return typeof value === "string" && MOBILE_PATTERN.test(value.trim());
}

function isValidFullName(value) {
  return typeof value === "string" && value.trim().length >= 2;
}

// ---------- Browser behavior (guarded so Node can load this file) ----------
if (typeof document !== "undefined") {
  (function () {
    var form = document.getElementById("registrationForm");
    if (!form) return;

    var $ = function (id) { return document.getElementById(id); };

    var inputs = {
      fullName: $("fullName"),
      studentNumber: $("studentNumber"),
      email: $("email"),
      mobileNumber: $("mobileNumber"),
      password: $("password"),
      confirmPassword: $("confirmPassword"),
      course: $("course"),
      terms: $("terms")
    };

    var successMessage = $("successMessage");
    var summary = $("registrationSummary");
    var passwordFeedback = $("passwordFeedback");

    function setError(name, message) {
      var field = inputs[name];
      var box = $(name + "Error");
      box.textContent = message;
      field.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    // Each checker returns an error message ("" when valid).
    var checks = {
      fullName: function () {
        var v = inputs.fullName.value.trim();
        if (v.length === 0) return "Enter your full name.";
        if (v.length < 2) return "Full name must be at least two characters.";
        return "";
      },
      studentNumber: function () {
        var v = inputs.studentNumber.value.trim();
        if (v.length === 0) return "Enter your student number.";
        if (!isValidStudentNumber(v)) return "Enter a student number in the format 24-1234-123.";
        return "";
      },
      email: function () {
        var v = inputs.email.value.trim();
        if (v.length === 0) return "Enter your email address.";
        if (!isValidEmail(v)) return "Enter a valid email address such as student@email.com.";
        return "";
      },
      mobileNumber: function () {
        var v = inputs.mobileNumber.value.trim();
        if (v.length === 0) return "Enter your mobile number.";
        if (!isValidMobile(v)) return "Enter a mobile number as 09XXXXXXXXX or +639XXXXXXXXX, with no spaces or hyphens.";
        return "";
      },
      password: function () {
        var v = inputs.password.value;
        if (v.length === 0) return "Enter a password.";
        if (!isValidPassword(v)) return "Password must meet all rules: " + missingRules(v).join(", ") + ".";
        return "";
      },
      confirmPassword: function () {
        var v = inputs.confirmPassword.value;
        if (v.length === 0) return "Confirm your password.";
        if (v !== inputs.password.value) return "Passwords do not match.";
        return "";
      },
      course: function () {
        var v = inputs.course.value;
        if (v !== "BSIT" && v !== "BSCS") return "Select BSIT or BSCS as your course.";
        return "";
      },
      terms: function () {
        return inputs.terms.checked ? "" : "You must agree to the terms to register.";
      }
    };

    function missingRules(v) {
      var missing = [];
      if (v.length < 8) missing.push("at least 8 characters");
      if (!/[A-Z]/.test(v)) missing.push("one uppercase letter");
      if (!/\d/.test(v)) missing.push("one digit");
      if (!/[@$!]/.test(v)) missing.push("one of @, $, or !");
      if (/\s/.test(v)) missing.push("no spaces");
      return missing;
    }

    function validateField(name) {
      return setError(name, checks[name]());
    }

    function updatePasswordFeedback() {
      var v = inputs.password.value;
      if (v.length === 0) {
        passwordFeedback.textContent = "";
        passwordFeedback.className = "feedback";
        return;
      }
      var missing = missingRules(v);
      if (missing.length === 0) {
        passwordFeedback.textContent = "Password meets all rules.";
        passwordFeedback.className = "feedback ok";
      } else {
        passwordFeedback.textContent = "Password still needs: " + missing.join(", ") + ".";
        passwordFeedback.className = "feedback";
      }
    }

    function hideResults() {
      successMessage.textContent = "";
      successMessage.hidden = true;
      summary.hidden = true;
      ["summaryName", "summaryStudentNumber", "summaryEmail",
       "summaryMobileNumber", "summaryCourse"].forEach(function (id) {
        $(id).textContent = "";
      });
    }

    // ----- submit -----
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideResults();

      var allValid = true;
      Object.keys(checks).forEach(function (name) {
        if (!validateField(name)) allValid = false;
      });
      updatePasswordFeedback();

      if (!allValid) {
        var firstBad = Object.keys(inputs).filter(function (n) {
          return inputs[n].getAttribute("aria-invalid") === "true";
        })[0];
        if (firstBad) inputs[firstBad].focus();
        return;
      }

      $("summaryName").textContent = inputs.fullName.value.trim();
      $("summaryStudentNumber").textContent = inputs.studentNumber.value.trim();
      $("summaryEmail").textContent = inputs.email.value.trim();
      $("summaryMobileNumber").textContent = inputs.mobileNumber.value.trim();
      $("summaryCourse").textContent = inputs.course.value;

      successMessage.textContent = "Registration details validated successfully!";
      successMessage.hidden = false;
      summary.hidden = false;
    });

    // ----- input: live password feedback -----
    inputs.password.addEventListener("input", function () {
      updatePasswordFeedback();
      if ($("passwordError").textContent) validateField("password");
      if (inputs.confirmPassword.value || $("confirmPasswordError").textContent) {
        validateField("confirmPassword");
      }
    });

    // ----- blur: full name -----
    inputs.fullName.addEventListener("blur", function () {
      validateField("fullName");
    });

    // ----- change: course and terms -----
    inputs.course.addEventListener("change", function () {
      validateField("course");
    });
    inputs.terms.addEventListener("change", function () {
      validateField("terms");
    });

    // ----- re-check corrected entries (clears the error when fixed) -----
    ["fullName", "studentNumber", "email", "mobileNumber", "confirmPassword"].forEach(function (name) {
      inputs[name].addEventListener("input", function () {
        if ($(name + "Error").textContent) validateField(name);
      });
    });

    // ----- reset -----
    form.addEventListener("reset", function () {
      Object.keys(inputs).forEach(function (name) {
        setError(name, "");
      });
      passwordFeedback.textContent = "";
      passwordFeedback.className = "feedback";
      hideResults();
    });

    hideResults();
  })();
}

// ---------- CommonJS export for the autograder ----------
if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber: isValidStudentNumber, isValidPassword: isValidPassword };
}
