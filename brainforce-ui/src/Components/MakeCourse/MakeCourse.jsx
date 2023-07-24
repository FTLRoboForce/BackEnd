import React, { useState } from "react";
import "./MakeCourse.css";
import einstein from "../../images/einstein.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import images for subjects
import mathImage from "./math.png";
import scienceImage from "./science.png";
import programmingImage from "./coding.png";

// Import images for difficulty levels
import easyImage from "./green.png";
import mediumImage from "./yellow.png";
import hardImage from "./red.png";

export default function MakeCourse({ userGlobal, setFlashcards }) {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const navigate = useNavigate();

  const handleSubjectChange = (selectedSubject) => {
    setSubject(selectedSubject);
  };

  const handleDifficultyChange = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3002/flashcard", {
        subject: subject,
        difficulty: difficulty,
        number: 2,
        optional: "",
      })
      .then((response) => {
        setFlashcards(JSON.parse(response.data.data));
        navigate("/flashcard");
      })
      .catch((error) => {
        console.log(error);
        console.error("There was an error!", error);
      });

    // Handle form submission
    // You can perform additional actions based on the selected subject and difficulty

    // Reset state after form submission
    setSubject("");
    setDifficulty("");
  };

  const isSubjectSelected = (selectedSubject) => {
    return subject === selectedSubject ? "selected" : "";
  };

  const isDifficultySelected = (selectedDifficulty) => {
    return difficulty === selectedDifficulty ? "selected" : "";
  };

  const isSubmitDisabled = !subject || !difficulty;

  return (
    <>
      {userGlobal ? (
        <div className="full-page-container">
          <div className="course-options-container">
            <h2>Choose Course Options</h2>
            <form onSubmit={handleSubmit}>
              <div className="option-row">
                <label
                  htmlFor="math"
                  className={`option ${isSubjectSelected("math")}`}
                  onClick={() => handleSubjectChange("math")}
                >
                  <img id="math-img" src={mathImage} alt="Math" />
                  Math
                </label>
                <label
                  htmlFor="science"
                  className={`option ${isSubjectSelected("science")}`}
                  onClick={() => handleSubjectChange("science")}
                >
                  <img src={scienceImage} alt="Science" />
                  Science
                </label>
                <label
                  htmlFor="programming"
                  className={`option ${isSubjectSelected("programming")}`}
                  onClick={() => handleSubjectChange("programming")}
                >
                  <img src={programmingImage} alt="Programming" />
                  Programming
                </label>
              </div>

              <div className="option-row">
                <label
                  htmlFor="easy"
                  className={`option ${isDifficultySelected("easy")}`}
                  onClick={() => handleDifficultyChange("easy")}
                >
                  <img src={easyImage} alt="Easy" />
                  Easy
                </label>
                <label
                  htmlFor="medium"
                  className={`option ${isDifficultySelected("medium")}`}
                  onClick={() => handleDifficultyChange("medium")}
                >
                  <img src={mediumImage} alt="Medium" />
                  Medium
                </label>
                <label
                  htmlFor="hard"
                  className={`option ${isDifficultySelected("hard")}`}
                  onClick={() => handleDifficultyChange("hard")}
                >
                  <img src={hardImage} alt="Hard" />
                  Hard
                </label>
              </div>

              <button
                className="make-course-button"
                type="submit"
                disabled={isSubmitDisabled}
              >
                Start Course
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flashcardPage-container">Please Log In</div>
      )}
    </>
  );
}
