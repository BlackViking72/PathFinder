from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from truck_delivery_path import get_shortest_distance

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['FLASK_APP'] = 'main'
app.config['FLASK_ENV'] = 'development'
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template('index.html')

@socketio.on('find_path')
def path(json_data):
    request_data = json_data
    get_shortest_distance(arr=request_data['map'], start_node=request_data['start'], emit=emit)

if __name__ == '__main__':
    socketio.run(app)