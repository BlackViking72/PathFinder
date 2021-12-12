from queue import Queue

class Node:
    def __init__(self, position, distance, parent, is_destination=False):
        self.position = position
        self.distance = distance
        self.parent = parent
        self.is_destination = is_destination

def get_adjacent_nodes(arr, r, c, **kwargs):
    dr = [-1,0,+1,0]
    dc = [0,+1,0,-1]
    valid_nodes = []
    for i in range(len(dr)):
        rr = r + dr[i]
        cc = c + dc[i]
        if rr < 0 or cc < 0: continue
        if rr >= len(arr): continue
        if cc >= len(arr[rr]): continue
        if arr[rr][cc] == 0 or [rr,cc] in kwargs['visited_positions']: continue

        # Valid position
        newNode = Node(
            position=[rr,cc],
            distance=kwargs['distance'],
            parent=kwargs['parent'],
            is_destination=arr[rr][cc] == 9
        )
        valid_nodes.append(newNode)
    return valid_nodes


def get_shortest_distance(arr, start_node, emit):
    start_node = Node(position=start_node, distance=0, parent=None)
    visited_nodes = []
    visited_position_array = []
    queue = Queue()
    queue.put(start_node)

    while not queue.empty():
        current_node = queue.get()

        if current_node.position in visited_position_array:
            continue

        visited_position_array.append(current_node.position)
        visited_nodes.append(current_node)
        # Send currently visited node
        emit('visited_node', current_node.position)

        # Stop searching if destination is reached
        if arr[current_node.position[0]][current_node.position[1]] == 9:
            break

        # Getting adjacent valid positions
        adj_positions = get_adjacent_nodes(arr, current_node.position[0], current_node.position[1], visited_positions=visited_position_array, parent=current_node, distance=current_node.distance + 1)

        # Continue if there is no valid adjacent positions
        if (len(adj_positions) <= 0):
            continue

        for adj_position in adj_positions:
            queue.put(adj_position)
            
    destination_reached = False
    visited_dest_nodes = []
    distance = 0
    for i in visited_nodes:
        if i.is_destination:
            destination_reached = True
            distance = i.distance
            current_node = i
            while current_node.parent != None:
                visited_dest_nodes.append(current_node.position)
                current_node = current_node.parent
            if current_node:
                visited_dest_nodes.append(current_node.position)
    response_data = {
        'pathFound': destination_reached
    }

    if destination_reached:
        response_data.update({
            'distance': distance,
            'path': visited_dest_nodes[::-1]
        })
    emit("final_result", response_data)


if __name__ == "__main__":
    input = [
        [1,1,0,1],
        [1,1,1,1],
        [1,0,9,1],
        [1,1,1,1],
        [0,0,1,1]
    ]
    # input = [
    #     [1,1,0],
    #     [1,0,0],
    #     [1,9,0]
    # ]
    
    get_shortest_distance(input)