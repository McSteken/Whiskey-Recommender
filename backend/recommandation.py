import os
import pandas as pd
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag


nltk.download('punkt_tab') # for tokenization
nltk.download('wordnet') # for lemmatization
nltk.download('averaged_perceptron_tagger_eng') # for POS tagging
nltk.download('stopwords') # for stopwords

# Colors for the output
PURPLE = '\033[95m'
GREEN = '\033[92m'
BLUE = '\033[94m'
END = '\033[0m'
BOLD = '\033[1m'
UNDERLINE = '\033[4m'

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'whiskey_data.csv')

# Load the data using the absolute path
whiskey_data = pd.read_csv(csv_path)
# Check for missing values
#print(whiskey_data.isnull().sum())

# Convert the 'price' column to numeric values
whiskey_data['price'] = pd.to_numeric(whiskey_data['price'], errors='coerce')

# Words that dont really add anything
custom_stop_words = set(stopwords.words('english')).union({'whiskey', 'whisky', 'bottle', 'flavor', 'taste'})

def preprocess_text(text):
    # Tokenize the text
    tokens = word_tokenize(text.lower())
     # Lemmatize the tokens (convert to their base form)
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    # Remove stop words
    tokens = [token for token in tokens if token not in custom_stop_words]
    # POS tagging (which means assigning a part of speech to each word, such as noun, verb, adjective, etc.)
    tagged_tokens = pos_tag(tokens)
    # Filter for nouns, adjectives, and adverbs
    keywords = [word for word, tag in tagged_tokens if tag in ('NN', 'NNS', 'JJ', 'RB')] # NN: noun, NNS: plural noun, JJ: adjective, RB: adverb
    return ' '.join(keywords)

# Preprocess the descriptions
whiskey_data['preprocessed_description'] = whiskey_data['description'].apply(preprocess_text)

def filter_price(price):
    return whiskey_data[whiskey_data['price'] <= price]

def get_recommendations(index, price):
    try:
        # Filter whiskies based on price
        filtered_whiskey = filter_price(price)

        # Ensure the index corresponds to the original whiskey_data DataFrame
        original_whiskey = whiskey_data.iloc[index]
        print(f"Original whiskey: {original_whiskey['name']}")

        # Vectorize the descriptions using tf-idf
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(filtered_whiskey['preprocessed_description'])

        # Calculate the cosine similarity between the original whiskey and the filtered whiskies
        original_tfidf = vectorizer.transform([original_whiskey['preprocessed_description']])
        cosine_sim = cosine_similarity(original_tfidf, tfidf_matrix).flatten()

        # Get the pairwise similarity scores of all whiskies with the selected whiskey
        sim_scores = list(enumerate(cosine_sim))

        # Filter out the original whiskey from the similarity scores
        sim_scores = [score for score in sim_scores if filtered_whiskey.iloc[score[0]]['name'] != original_whiskey['name']]

        # Sort the whiskies based on the similarity scores
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Get the scores of the 10 most similar whiskies
        sim_scores = sim_scores[:10]

        # Get the whiskey indices
        whiskey_indices = [i[0] for i in sim_scores]

        # Print the name of the selected whiskey
        print(f"\n{PURPLE}{UNDERLINE}Whiskeys most similar to {original_whiskey['name']}:{END}")
        #print(f"preprocessed description of {original_whiskey['name']}: {original_whiskey['preprocessed_description']}")
        for i, score in zip(whiskey_indices, sim_scores):
            print(f"{GREEN}{BOLD}{filtered_whiskey['name'].iloc[i]}{END}: {score[1]:.6f} {BLUE}Price: {END}${filtered_whiskey['price'].iloc[i]}")
            #print preprocessed description of the whiskey
            #print(f"Preprocessed description: {filtered_whiskey['preprocessed_description'].iloc[i]}")

        # Return the top 10 most similar whiskies as a list of dictionaries
        recommendations = filtered_whiskey.iloc[whiskey_indices].to_dict('records')
        for i, score in zip(range(len(recommendations)), sim_scores):
            recommendations[i]['similarity_score'] = score[1]
            recommendations[i]['preprocessed_description'] = filtered_whiskey.iloc[whiskey_indices[i]]['preprocessed_description']
        return recommendations
    
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        raise