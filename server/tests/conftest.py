import warnings
import urllib3

# Disable ALL warnings during tests
warnings.filterwarnings("ignore")

# Alternatively, if you want to be slightly more selective but still simple:
# warnings.filterwarnings("ignore", category=DeprecationWarning)
# warnings.filterwarnings("ignore", category=Warning, module='urllib3')

# Disable ALL urllib3 warnings
urllib3.disable_warnings()

# Filter known warnings
warnings.filterwarnings("ignore", category=Warning, module='urllib3')
warnings.filterwarnings("ignore", category=DeprecationWarning, module='numpy.core._multiarray_umath')
warnings.filterwarnings("ignore", category=DeprecationWarning, module='faiss.loader')
warnings.filterwarnings("ignore", message="builtin type SwigPyPacked has no __module__ attribute")
warnings.filterwarnings("ignore", message="builtin type SwigPyObject has no __module__ attribute")
warnings.filterwarnings("ignore", message="builtin type swigvarlink has no __module__ attribute")
warnings.filterwarnings("ignore", message=".*OpenSSL 1.1.1.*")
warnings.filterwarnings("ignore", message=".*LibreSSL.*") 