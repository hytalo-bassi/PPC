import requests
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import multiprocessing

# Lock for thread-safe file operations and counter updates
write_lock = Lock()
counter_lock = Lock()

# Global counters
successful = 0
failed = 0

def fetch_course_data(code):
    """
    Fetch course prerequisites data for a given code.
    
    Args:
        code: 4-digit code as string (e.g., '0001')
    
    Returns:
        dict or None: JSON response if successful and has any elements, None otherwise
    """
    url = f'https://graduacao.ufms.br/portal/matriz/get-pre-requisitos/{code}'
    
    headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'X-Requested-With': 'XMLHttpRequest',
        'Sec-GPC': '1',
        'Connection': 'keep-alive',
        'Referer': f'https://graduacao.ufms.br/cursos/{code}/matriz',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        # Check if response is successful
        if response.status_code == 200:
            # Try to parse as JSON
            data = response.json()
            if len(data) == 0:
                return None
            return data
        else:
            return None
            
    except (requests.RequestException, json.JSONDecodeError) as e:
        return None

def process_code(code_num, output_dir):
    """
    Process a single code: fetch data and save if valid.
    
    Args:
        code_num: Integer code number
        output_dir: Directory to save JSON files
    
    Returns:
        tuple: (code, success_status)
    """
    global successful, failed
    
    # Format code as 4-digit string with leading zeros
    code = f"{code_num:04d}"
    
    # Fetch data
    data = fetch_course_data(code)
    
    if data is not None:
        # Save to JSON file (thread-safe)
        filename = os.path.join(output_dir, f"{code}.json")
        
        with write_lock:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        
        with counter_lock:
            successful += 1
            print(f"✓ {code}: Saved to {filename}")
        
        return (code, True)
    else:
        with counter_lock:
            failed += 1
            if code_num % 100 == 0:  # Print progress every 100 attempts
                print(f"✗ Progress: {code} (Success: {successful}, Failed: {failed})")
        
        return (code, False)

def main():
    global successful, failed
    
    # Create output directory if it doesn't exist
    output_dir = 'json'
    os.makedirs(output_dir, exist_ok=True)
    
    # Get number of available CPU threads
    num_threads = multiprocessing.cpu_count()
    
    print("Starting to fetch course data from 0000 to 9999...")
    print(f"Output directory: {output_dir}/")
    print(f"Using {num_threads} threads")
    print("-" * 50)
    
    successful = 0
    failed = 0
    
    # Create thread pool and process all codes
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        # Submit all tasks
        futures = [executor.submit(process_code, code_num, output_dir) 
                   for code_num in range(10000)]
        
        # Wait for all tasks to complete
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Error processing code: {e}")
    
    print("-" * 50)
    print(f"Completed!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total processed: {successful + failed}")

if __name__ == "__main__":
    main()
