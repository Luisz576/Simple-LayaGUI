const api = new ApiService();

const questionsContainer = document.getElementById('questionsContainer');
let questionCount = 0;

function addQuestion() {
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.id = `question-${questionCount}`;
    questionItem.innerHTML = `
        <div class="question-header">
            <button type="button" class="btn-remove-question" onclick="removeQuestion(this)">Remove</button>
        </div>
        <div class="question-editor">
            <select class="question-type-select" disabled>
                <option value="score">score</option>
            </select>
            <input type="text" class="question-instructions" placeholder="Instructions...">
            <div class="criteria-container"></div>
        </div>
    `;
    questionsContainer.appendChild(questionItem);
    renderCriteria(questionItem.querySelector('.criteria-container'));
    questionCount++;
}

function removeQuestion(btn) {
    const questionItem = btn.closest('.question-item');
    questionItem.remove();
}

function renderCriteria(container) {
    container.innerHTML = '';
    
    const criteriaInput = document.createElement('input');
    criteriaInput.type = 'text';
    criteriaInput.className = 'criteria-chip-input';
    criteriaInput.placeholder = 'Option';
    container.appendChild(criteriaInput);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-plus';
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
        e.stopPropagation();
        addCriteriaItem(e.target);
    };
    container.appendChild(addBtn);
}

function addCriteriaItem(addBtn) {
    const questionItem = addBtn.closest('.question-item');
    const criteriaContainer = questionItem.querySelector('.criteria-container');
    
    const criteriaInput = document.createElement('input');
    criteriaInput.type = 'text';
    criteriaInput.className = 'criteria-chip-input';
    criteriaInput.placeholder = 'Option';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeCriteriaItem(removeBtn);
    };
    
    criteriaContainer.appendChild(criteriaInput);
    criteriaContainer.appendChild(removeBtn);
}

function removeCriteriaItem(btn) {
    const criteriaContainer = btn.closest('.criteria-container');
    const inputs = criteriaContainer.querySelectorAll('.criteria-chip-input');
    
    if (inputs.length <= 1) {
        btn.parentElement.style.opacity = '0.3';
        btn.disabled = true;
        return;
    }
    
    const item = btn.parentElement;
    item.remove();
}

const runBtn = document.getElementById('runBtn');
runBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';

    const stateInput = document.getElementById('stateInput');
    const state = stateInput.value.trim();

    const questions = [];
    const questionItems = questionsContainer.querySelectorAll('.question-item');
    
    questionItems.forEach((item, index) => {
        const instructions = item.querySelector('.question-instructions').value.trim() || '';
        
        const criteria = [];
        const criteriaInputs = item.querySelectorAll('.criteria-chip-input');
        
        criteriaInputs.forEach(input => {
            if (input.value.trim()) {
                criteria.push(input.value.trim());
            }
        });

        questions.push({
            type: 'score',
            instructions: instructions,
            criteria: criteria
        });
    });

    const finalQuestions = {};
    questions.forEach((question, i) => {
        finalQuestions[`key_${i}`] = {
            type: question.type,
            instructions: question.instructions,
            criteria: question.criteria
        };
    });

    const data = {
        state: state,
        choices: finalQuestions
    };

    console.log('Sending to backend:', JSON.stringify(data, null, 2));

    try {
        const result = await api.question(data.state, data.choices);
        console.log('Response:', result);
        displayResults(result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = 'Run';
    }
});

function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!result.data) {
        resultsContent.innerHTML = '<p>No data received</p>';
        return;
    }
    
    const { data, timestamp } = result;
    const { answers, model, routing, usage } = data;
    
    let html = `<p><strong>Timestamp:</strong> ${timestamp}</p>`;
    
    if (model) {
        html += `<p><strong>Model:</strong> ${model}</p>`;
    }
    
    if (answers) {
        for (const [key, answer] of Object.entries(answers)) {
            html += `<div class="answer-item">
                <div class="answer-key">Question: ${key}</div>
                <div class="answer-confidence">
                    <strong>Answer Confidence:</strong> ${answer.answer_confidence.toFixed(4)}
                </div>
                <div class="confidence">
                    <strong>Confidence:</strong> ${answer.confidence.toFixed(4)}
                </div>`;
            
            if (answer.legend) {
                html += `<div class="legend">
                    <strong>Legend:</strong>
                    <ul>`;
                for (const [num, label] of Object.entries(answer.legend)) {
                    html += `<li>${num}: ${label}</li>`;
                }
                html += `</ul>
                </div>`;
            }
            
            if (answer.probabilities) {
                html += `<div class="probabilities">
                    <strong>Probabilities:</strong>
                    <ul>`;
                for (const [num, prob] of Object.entries(answer.probabilities)) {
                    html += `<li>${num}: ${(prob * 100).toFixed(2)}%</li>`;
                }
                html += `</ul>
                </div>`;
            }
            
            if (answer.score !== undefined) {
                html += `<div class="score">
                    <strong>Score:</strong> ${answer.score.toFixed(4)}
                </div>`;
            }
            
            if (answer.action) {
                html += `<div class="action">
                    <strong>Action Probability:</strong> ${answer.action.act_probability.toFixed(4)}
                </div>`;
            }
            
            html += `</div>`;
        }
    }
    
    if (routing) {
        html += `<div class="routing-section">
            <h3>Routing</h3>
            <p><strong>Model:</strong> ${routing.model}</p>
            <p><strong>Reason:</strong> ${routing.reason}</p>
            <p><strong>Language:</strong> ${routing.detection.language}</p>
            <p><strong>Script:</strong> ${routing.detection.script}</p>
        </div>`;
    }
    
    if (usage) {
        html += `<div class="usage-section">
            <h3>Usage</h3>
            <p><strong>Input Tokens:</strong> ${usage.input_tokens}</p>
            <p><strong>Output Tokens:</strong> ${usage.output_tokens}</p>
            <p><strong>State Tokens:</strong> ${usage.state_tokens}</p>
        </div>`;
    }
    
    resultsContent.innerHTML = html;
}

addQuestion();