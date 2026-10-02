class ApiService {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
    }

    async question(state, choices) {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state, choices })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na chamada API:', error);
            throw error;
        }
    }
}
